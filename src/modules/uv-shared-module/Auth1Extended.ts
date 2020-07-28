import OK = HTTPStatusCode.OK;
import MOVED_TEMPORARILY = HTTPStatusCode.MOVED_TEMPORARILY;
import UNAUTHORIZED = HTTPStatusCode.UNAUTHORIZED;

export class Auth1Extended {
    static loadExternalResourcesAuth1(
        resources: Manifesto.IExternalResource[],
        openContentProviderInteraction: (service: Manifesto.IService) => any,
        openTokenService: (
            resource: Manifesto.IExternalResource,
            tokenService: Manifesto.IService
        ) => Promise<any>,
        getStoredAccessToken: (
            resource: Manifesto.IExternalResource
        ) => Promise<Manifesto.IAccessToken | null>,
        userInteractedWithContentProvider: (
            contentProviderInteraction: any
        ) => Promise<any>,
        getContentProviderInteraction: (
            resource: Manifesto.IExternalResource,
            service: Manifesto.IService
        ) => Promise<any>,
        handleMovedTemporarily: (resource: Manifesto.IExternalResource) => Promise<any>,
        showOutOfOptionsMessages: (
            resource: Manifesto.IExternalResource,
            service: Manifesto.IService
        ) => void
    ): Promise<Manifesto.IExternalResource[]> {
        return new Promise<Manifesto.IExternalResource[]>((resolve, reject) => {
            const promises = resources.map((resource: Manifesto.IExternalResource) => {
                return Auth1Extended.loadExternalResourceAuth1(
                    resource,
                    openContentProviderInteraction,
                    openTokenService,
                    getStoredAccessToken,
                    userInteractedWithContentProvider,
                    getContentProviderInteraction,
                    handleMovedTemporarily,
                    showOutOfOptionsMessages
                );
            });

            Promise.all(promises)
                .then(() => {
                    resolve(resources);
                })
                ["catch"](error => {
                reject(error);
            });
        });
    }

    static async loadExternalResourceAuth1(
        resource: Manifesto.IExternalResource,
        openContentProviderInteraction: (service: Manifesto.IService) => any,
        openTokenService: (
            resource: Manifesto.IExternalResource,
            tokenService: Manifesto.IService
        ) => Promise<void>,
        getStoredAccessToken: (
            resource: Manifesto.IExternalResource
        ) => Promise<Manifesto.IAccessToken | null>,
        userInteractedWithContentProvider: (
            contentProviderInteraction: any
        ) => Promise<any>,
        getContentProviderInteraction: (
            resource: Manifesto.IExternalResource,
            service: Manifesto.IService
        ) => Promise<any>,
        handleMovedTemporarily: (resource: Manifesto.IExternalResource) => Promise<any>,
        showOutOfOptionsMessages: (
            resource: Manifesto.IExternalResource,
            service: Manifesto.IService
        ) => void
    ): Promise<Manifesto.IExternalResource> {
        const storedAccessToken: Manifesto.IAccessToken | null = await getStoredAccessToken(
            resource
        );

        if (storedAccessToken) {
            await resource.getData(storedAccessToken);

            if (resource.status === OK) {
                return resource;
            } else {
                // the stored token is no good for this resource
                await Auth1Extended.doAuthChain(
                    resource,
                    openContentProviderInteraction,
                    openTokenService,
                    userInteractedWithContentProvider,
                    getContentProviderInteraction,
                    handleMovedTemporarily,
                    showOutOfOptionsMessages
                );
            }

            if (resource.status === OK || resource.status === MOVED_TEMPORARILY) {
                return resource;
            }

            throw manifesto.Utils.createAuthorizationFailedError();
        } else {
            await resource.getData();

            if (
                resource.status === MOVED_TEMPORARILY ||
                resource.status === UNAUTHORIZED
            ) {
                await Auth1Extended.doAuthChain(
                    resource,
                    openContentProviderInteraction,
                    openTokenService,
                    userInteractedWithContentProvider,
                    getContentProviderInteraction,
                    handleMovedTemporarily,
                    showOutOfOptionsMessages
                );
            }

            if (resource.status === OK || resource.status === MOVED_TEMPORARILY) {
                return resource;
            }

            throw manifesto.Utils.createAuthorizationFailedError();
        }
    }

    static async doAuthChain(
        resource: Manifesto.IExternalResource,
        openContentProviderInteraction: (service: Manifesto.IService) => any,
        openTokenService: (
            resource: Manifesto.IExternalResource,
            tokenService: Manifesto.IService
        ) => Promise<any>,
        userInteractedWithContentProvider: (
            contentProviderInteraction: any
        ) => Promise<any>,
        getContentProviderInteraction: (
            resource: Manifesto.IExternalResource,
            service: Manifesto.IService
        ) => Promise<any>,
        handleMovedTemporarily: (resource: Manifesto.IExternalResource) => Promise<any>,
        showOutOfOptionsMessages: (
            resource: Manifesto.IExternalResource,
            service: Manifesto.IService
        ) => void
    ): Promise<Manifesto.IExternalResource | void> {
        // This function enters the flowchart at the < External? > junction
        // http://iiif.io/api/auth/1.0/#workflow-from-the-browser-client-perspective
        if (!resource.isAccessControlled()) {
            return resource; // no services found
        }

        // add options to all services.
        const externalService: Manifesto.IService | null = resource.externalService;

        if (externalService) {
            externalService.options = <Manifesto.IManifestoOptions>resource.options;
        }

        const kioskService: Manifesto.IService | null = resource.kioskService;

        if (kioskService) {
            kioskService.options = <Manifesto.IManifestoOptions>resource.options;
        }

        const clickThroughService: Manifesto.IService | null = resource.clickThroughService;

        if (clickThroughService) {
            clickThroughService.options = <Manifesto.IManifestoOptions>resource.options;
        }

        const loginService: Manifesto.IService | null = resource.loginService;

        if (loginService) {
            loginService.options = <Manifesto.IManifestoOptions>resource.options;
        }

        if (!resource.isResponseHandled && resource.status === MOVED_TEMPORARILY) {
            await handleMovedTemporarily(resource);
            return resource;
        }

        let serviceToTry: Manifesto.IService | null = null;
        let lastAttempted: Manifesto.IService | null = null;

        // repetition of logic is left in these steps for clarity:

        // Looking for external pattern
        serviceToTry = externalService;

        if (serviceToTry) {
            lastAttempted = serviceToTry;
            await manifesto.Utils.attemptResourceWithToken(
                resource as Manifesto.IExternalResource,
                openTokenService,
                serviceToTry
            );
            return resource;
        }

        // Looking for kiosk pattern
        serviceToTry = kioskService;

        if (serviceToTry) {
            lastAttempted = serviceToTry;
            let kioskInteraction = openContentProviderInteraction(serviceToTry);
            if (kioskInteraction) {
                await userInteractedWithContentProvider(kioskInteraction);
                await manifesto.Utils.attemptResourceWithToken(
                    resource,
                    openTokenService,
                    serviceToTry
                );
                return resource;
            }
        }

        // The code for the next two patterns is identical (other than the profile name).
        // The difference is in the expected behaviour of
        //
        //    await userInteractedWithContentProvider(contentProviderInteraction);
        //
        // For clickthrough the opened window should close immediately having established
        // a session, whereas for login the user might spend some time entering credentials etc.

        // Looking for clickthrough pattern
        serviceToTry = clickThroughService;

        if (serviceToTry) {
            lastAttempted = serviceToTry;
            let contentProviderInteraction = await getContentProviderInteraction(
                resource,
                serviceToTry
            );
            if (contentProviderInteraction) {
                // should close immediately
                await userInteractedWithContentProvider(contentProviderInteraction);
                await manifesto.Utils.attemptResourceWithToken(
                    resource,
                    openTokenService,
                    serviceToTry
                );
                return resource;
            }
        }

        // Looking for login pattern
        serviceToTry = loginService;

        if (serviceToTry) {
            lastAttempted = serviceToTry;
            let contentProviderInteraction = await getContentProviderInteraction(
                resource,
                serviceToTry
            );
            if (contentProviderInteraction) {
                // we expect the user to spend some time interacting
                await userInteractedWithContentProvider(contentProviderInteraction);
                await manifesto.Utils.attemptResourceWithToken(
                    resource,
                    openTokenService,
                    serviceToTry
                );
                return resource;
            }
        }

        // nothing worked! Use the most recently tried service as the source of
        // messages to show to the user.
        if (lastAttempted) {
            showOutOfOptionsMessages(resource, lastAttempted);
        }
    }
}

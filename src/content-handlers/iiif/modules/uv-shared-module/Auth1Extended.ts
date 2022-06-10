import {
    Annotation,
    AnnotationBody,
    Canvas,
    IAccessToken,
    IExternalResource,
    IManifestoOptions,
    Service,
    Utils
} from 'manifesto.js';
import {MOVED_TEMPORARILY, OK, UNAUTHORIZED} from '@edsilv/http-status-codes';
import {ExternalResource} from '@iiif/manifold';
import {ServiceProfile} from '@iiif/vocabulary';

export class Auth1Extended {
    static loadExternalResourcesAuth1(
        resources: IExternalResource[],
        openContentProviderInteraction: (service: Service) => any,
        openTokenService: (
            resource: IExternalResource,
            tokenService: Service
        ) => Promise<any>,
        getStoredAccessToken: (
            resource: IExternalResource
        ) => Promise<IAccessToken | null>,
        userInteractedWithContentProvider: (
            contentProviderInteraction: any
        ) => Promise<any>,
        getContentProviderInteraction: (
            resource: IExternalResource,
            service: Service
        ) => Promise<any>,
        handleMovedTemporarily: (resource: IExternalResource) => Promise<any>,
        showOutOfOptionsMessages: (
            resource: IExternalResource,
            service: Service
        ) => void
    ): Promise<IExternalResource[]> {
        return new Promise<IExternalResource[]>((resolve, reject) => {
            const promises = resources.map((resource: IExternalResource) => {
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
                ['catch'](error => {
                reject(error);
            });
        });
    }

    static async loadExternalResourceAuth1(
        resource: IExternalResource,
        openContentProviderInteraction: (service: Service) => any,
        openTokenService: (
            resource: IExternalResource,
            tokenService: Service
        ) => Promise<void>,
        getStoredAccessToken: (
            resource: IExternalResource
        ) => Promise<IAccessToken | null>,
        userInteractedWithContentProvider: (
            contentProviderInteraction: any
        ) => Promise<any>,
        getContentProviderInteraction: (
            resource: IExternalResource,
            service: Service
        ) => Promise<any>,
        handleMovedTemporarily: (resource: IExternalResource) => Promise<any>,
        showOutOfOptionsMessages: (
            resource: IExternalResource,
            service: Service
        ) => void
    ): Promise<IExternalResource> {
        const storedAccessToken: IAccessToken | null = await getStoredAccessToken(
            resource
        );

        if (storedAccessToken) {
            await Auth1Extended.getData(resource as ExternalResource, storedAccessToken);

            if (resource.status === OK) {
                return resource;
            }
            else {
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

            throw Utils.createAuthorizationFailedError();
        }
        else {
            await Auth1Extended.getData(resource as ExternalResource);

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

            throw Utils.createAuthorizationFailedError();
        }
    }

    static async doAuthChain(
        resource: IExternalResource,
        openContentProviderInteraction: (service: Service) => any,
        openTokenService: (
            resource: IExternalResource,
            tokenService: Service
        ) => Promise<any>,
        userInteractedWithContentProvider: (
            contentProviderInteraction: any
        ) => Promise<any>,
        getContentProviderInteraction: (
            resource: IExternalResource,
            service: Service
        ) => Promise<any>,
        handleMovedTemporarily: (resource: IExternalResource) => Promise<any>,
        showOutOfOptionsMessages: (
            resource: IExternalResource,
            service: Service
        ) => void
    ): Promise<IExternalResource | void> {
        // This function enters the flowchart at the < External? > junction
        // http://iiif.io/api/auth/1.0/#workflow-from-the-browser-client-perspective
        if (!resource.isAccessControlled()) {
            return resource; // no services found
        }

        // add options to all services.
        const externalService: Service | null = resource.externalService;

        if (externalService) {
            externalService.options = <IManifestoOptions>resource.options;
        }

        const kioskService: Service | null = resource.kioskService;

        if (kioskService) {
            kioskService.options = <IManifestoOptions>resource.options;
        }

        const clickThroughService: Service | null = resource.clickThroughService;

        if (clickThroughService) {
            clickThroughService.options = <IManifestoOptions>resource.options;
        }

        const loginService: Service | null = resource.loginService;

        if (loginService) {
            loginService.options = <IManifestoOptions>resource.options;
        }

        if (!resource.isResponseHandled && resource.status === MOVED_TEMPORARILY) {
            await handleMovedTemporarily(resource);
            return resource;
        }

        let serviceToTry: Service | null = null;
        let lastAttempted: Service | null = null;

        // repetition of logic is left in these steps for clarity:

        // Looking for external pattern
        serviceToTry = externalService;

        if (serviceToTry) {
            lastAttempted = serviceToTry;
            await Auth1Extended.attemptResourceWithToken(
                resource,
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
                await Auth1Extended.attemptResourceWithToken(
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
                await Auth1Extended.attemptResourceWithToken(
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
                await Auth1Extended.attemptResourceWithToken(
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

    static async attemptResourceWithToken(
        resource: IExternalResource,
        openTokenService: (
            resource: IExternalResource,
            tokenService: Service
        ) => Promise<any>,
        authService: Service
    ): Promise<IExternalResource | void> {
        // attempting token interaction for " + authService["@id"]
        const tokenService: Service | null = authService.getService(
            ServiceProfile.AUTH_1_TOKEN
        );

        if (tokenService) {
            // found token service: " + tokenService["@id"]);
            let tokenMessage: any = await openTokenService(resource, tokenService);

            if (tokenMessage && tokenMessage.accessToken) {
                await Auth1Extended.getData(resource as ExternalResource, tokenMessage);
                return resource;
            }
        }
    }

    static getData(resource: ExternalResource, accessToken?: IAccessToken): Promise<ExternalResource> {
        resource.data = {};

        return new Promise<ExternalResource>((resolve, reject) => {
            if (!resource.dataUri) {
                reject('There is no dataUri to fetch');
                return;
            }

            // if the resource has a probe service, use that to get http status code
            if (resource.probeService) {
                resource.isProbed = true;

                $.ajax(<JQueryAjaxSettings>{
                    url: resource.probeService.id,
                    type: 'GET',
                    dataType: 'json',
                    beforeSend: (xhr) => {
                        if (accessToken) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken.accessToken);
                        }
                    }
                }).done((data: any) => {
                    let contentLocation: string = unescape(data.contentLocation);

                    if (contentLocation !== resource.dataUri) {
                        resource.status = MOVED_TEMPORARILY;
                    }
                    else {
                        resource.status = OK;
                    }

                    resolve(resource);
                }).fail((error) => {
                    resource.status = error.status;
                    resource.error = error;
                    resolve(resource);

                });
            }
            else {
                // check if dataUri ends with info.json
                // if not issue a HEAD request.

                let type: string = 'GET';

                if (!resource.hasServiceDescriptor()) {
                    // If access control is unnecessary, short circuit the process.
                    // Note that isAccessControlled check for short-circuiting only
                    // works in the "binary resource" context, since in that case,
                    // we know about access control from the manifest. For image
                    // resources, we need to check info.json for details and can't
                    // short-circuit like this.
                    if (!resource.isAccessControlled()) {
                        resource.status = OK;
                        resolve(resource);
                        return;
                    }
                    type = 'HEAD';
                }

                $.ajax(<JQueryAjaxSettings>{
                    url: resource.dataUri,
                    type: type,
                    dataType: 'json',
                    beforeSend: (xhr) => {
                        if (accessToken) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken.accessToken);
                        }
                    }
                }).done((data: any) => {
                    // if it's a resource without an info.json
                    // todo: if resource doesn't have a @profile
                    if (!data) {
                        resource.status = OK;
                        resolve(resource);
                    }
                    else {
                        let uri: string = unescape(data['@id']);

                        resource.data = data;
                        Auth1Extended.parseAuthServices(resource, resource.data);

                        // remove trailing /info.json
                        if (uri.endsWith('/info.json')) {
                            uri = uri.substr(0, uri.lastIndexOf('/'));
                        }

                        let dataUri: string | null = resource.dataUri;

                        if (dataUri && dataUri.endsWith('/info.json')) {
                            dataUri = dataUri.substr(0, dataUri.lastIndexOf('/'));
                        }

                        // if the request was redirected to a degraded version and there's a login service to get the full quality version
                        if (uri !== dataUri && resource.loginService) {
                            resource.status = MOVED_TEMPORARILY;
                        }
                        else {
                            resource.status = OK;
                        }

                        resolve(resource);
                    }
                }).fail((error) => {
                    resource.status = error.status;
                    resource.error = error;
                    if (error.responseJSON) {
                        Auth1Extended.parseAuthServices(resource, error.responseJSON);
                    }
                    resolve(resource);

                });
            }
        });
    }

    static parseAuthServices(res: ExternalResource, resource: any): void {
        if (res.authAPIVersion === 0.9) {
            res.clickThroughService = Utils.getService(
                resource,
                ServiceProfile.AUTH_0_CLICK_THROUGH
            );
            res.loginService = Utils.getService(
                resource,
                ServiceProfile.AUTH_0_LOGIN
            );
            res.restrictedService = Utils.getService(
                resource,
                ServiceProfile.AUTH_0_RESTRICTED
            );

            if (res.clickThroughService) {
                res.logoutService = res.clickThroughService.getService(
                    ServiceProfile.AUTH_0_LOGOUT
                );
                res.tokenService = res.clickThroughService.getService(
                    ServiceProfile.AUTH_0_TOKEN
                );
            }
            else if (res.loginService) {
                res.logoutService = res.loginService.getService(
                    ServiceProfile.AUTH_0_LOGOUT
                );
                res.tokenService = res.loginService.getService(
                    ServiceProfile.AUTH_0_TOKEN
                );
            }
            else if (res.restrictedService) {
                res.logoutService = res.restrictedService.getService(
                    ServiceProfile.AUTH_0_LOGOUT
                );
                res.tokenService = res.restrictedService.getService(
                    ServiceProfile.AUTH_0_TOKEN
                );
            }
        }
        else {
            // auth 1

            // if the resource is a canvas, not an info.json, look for auth services on its content.
            if (resource.isCanvas !== undefined && resource.isCanvas()) {
                const content: Annotation[] = (<Canvas>resource).getContent();

                if (content && content.length) {
                    const body: AnnotationBody[] = content[0].getBody();

                    if (body && body.length) {
                        const annotation: AnnotationBody = body[0];
                        resource = annotation;
                    }
                }
            }

            res.clickThroughService = Utils.getService(
                resource,
                ServiceProfile.AUTH_1_CLICK_THROUGH
            );
            res.loginService = Utils.getService(
                resource,
                ServiceProfile.AUTH_1_LOGIN
            );
            res.externalService = Utils.getService(
                resource,
                ServiceProfile.AUTH_1_EXTERNAL
            );
            res.kioskService = Utils.getService(
                resource,
                ServiceProfile.AUTH_1_KIOSK
            );

            if (res.clickThroughService) {
                res.logoutService = res.clickThroughService.getService(
                    ServiceProfile.AUTH_1_LOGOUT
                );
                res.tokenService = res.clickThroughService.getService(
                    ServiceProfile.AUTH_1_TOKEN
                );
                res.probeService = res.clickThroughService.getService(
                    ServiceProfile.AUTH_1_PROBE
                );
            }
            else if (res.loginService) {
                res.logoutService = res.loginService.getService(
                    ServiceProfile.AUTH_1_LOGOUT
                );
                res.tokenService = res.loginService.getService(
                    ServiceProfile.AUTH_1_TOKEN
                );

                res.probeService = Utils.getService(
                    resource,
                    ServiceProfile.AUTH_1_PROBE
                );

                // @deprecated - the probe should be on the resource.
                if (!res.probeService) {
                    res.probeService = res.loginService.getService(
                        ServiceProfile.AUTH_1_PROBE
                    );
                }
            }
            else if (res.externalService) {
                res.logoutService = res.externalService.getService(
                    ServiceProfile.AUTH_1_LOGOUT
                );
                res.tokenService = res.externalService.getService(
                    ServiceProfile.AUTH_1_TOKEN
                );
                res.probeService = Utils.getService(
                    resource,
                    ServiceProfile.AUTH_1_PROBE
                );

                // @deprecated - the probe should be on the resource.
                if (!res.probeService) {
                    res.probeService = res.externalService.getService(
                        ServiceProfile.AUTH_1_PROBE
                    );
                }
            }
            else if (res.kioskService) {
                res.logoutService = res.kioskService.getService(
                    ServiceProfile.AUTH_1_LOGOUT
                );
                res.tokenService = res.kioskService.getService(
                    ServiceProfile.AUTH_1_TOKEN
                );
                res.probeService = Utils.getService(
                    resource,
                    ServiceProfile.AUTH_1_PROBE
                );

                // @deprecated - the probe should be on the resource.
                if (!res.probeService) {
                    res.probeService = res.kioskService.getService(
                        ServiceProfile.AUTH_1_PROBE
                    );
                }
            }
        }
    }
}
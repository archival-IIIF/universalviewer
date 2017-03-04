import {BaseEvents} from "../../modules/uv-shared-module/BaseEvents";
import {BaseExtension} from "../../modules/uv-shared-module/BaseExtension";
import {Bookmark} from "../../modules/uv-shared-module/Bookmark";
import {Bootstrapper} from "../../Bootstrapper";
import {ContentLeftPanel} from "../../modules/uv-contentleftpanel-module/ContentLeftPanel";
import {DownloadDialogue} from "./DownloadDialogue";
import {FooterPanel} from "../../modules/uv-shared-module/FooterPanel";
import {HeaderPanel} from "../../modules/uv-shared-module/HeaderPanel";
import {HelpDialogue} from "../../modules/uv-dialogues-module/HelpDialogue";
import {IVirtexExtension} from "./IVirtexExtension";
import {MoreInfoRightPanel} from "../../modules/uv-moreinforightpanel-module/MoreInfoRightPanel";
import {SettingsDialogue} from "./SettingsDialogue";
import {ShareDialogue} from "./ShareDialogue";
import {Shell} from "../../modules/uv-shared-module/Shell";
import {VirtexCenterPanel} from "../../modules/uv-virtexcenterpanel-module/VirtexCenterPanel";

export class Extension extends BaseExtension implements IVirtexExtension {

    $downloadDialogue: JQuery;
    $shareDialogue: JQuery;
    $helpDialogue: JQuery;
    $settingsDialogue: JQuery;
    centerPanel: VirtexCenterPanel;
    downloadDialogue: DownloadDialogue;
    shareDialogue: ShareDialogue;
    footerPanel: FooterPanel;
    headerPanel: HeaderPanel;
    helpDialogue: HelpDialogue;
    leftPanel: ContentLeftPanel;
    rightPanel: MoreInfoRightPanel;
    settingsDialogue: SettingsDialogue;

    constructor(bootstrapper: Bootstrapper) {
        super(bootstrapper);
    }

    create(): void {
        super.create();

        $.subscribe(BaseEvents.THUMB_SELECTED, (e: any, canvasIndex: number) => {
            this.viewCanvas(canvasIndex);
        });
    }

    createModules(): void{
        super.createModules();

        if (this.isHeaderPanelEnabled()){
            this.headerPanel = new HeaderPanel(Shell.$headerPanel);
        } else {
            Shell.$headerPanel.hide();
        }

        if (this.isLeftPanelEnabled()){
            this.leftPanel = new ContentLeftPanel(Shell.$leftPanel);
        }

        this.centerPanel = new VirtexCenterPanel(Shell.$centerPanel);

        if (this.isRightPanelEnabled()){
            this.rightPanel = new MoreInfoRightPanel(Shell.$rightPanel);
        }

        if (this.isFooterPanelEnabled()){
            this.footerPanel = new FooterPanel(Shell.$footerPanel);
        } else {
            Shell.$footerPanel.hide();
        }

        this.$downloadDialogue = $('<div class="overlay download"></div>');
        Shell.$overlays.append(this.$downloadDialogue);
        this.downloadDialogue = new DownloadDialogue(this.$downloadDialogue);

        this.$shareDialogue = $('<div class="overlay share"></div>');
        Shell.$overlays.append(this.$shareDialogue);
        this.shareDialogue = new ShareDialogue(this.$shareDialogue);

        this.$settingsDialogue = $('<div class="overlay settings"></div>');
        Shell.$overlays.append(this.$settingsDialogue);
        this.settingsDialogue = new SettingsDialogue(this.$settingsDialogue);

        if (this.isLeftPanelEnabled()){
            this.leftPanel.init();
        } else {
            Shell.$leftPanel.hide();
        }

        if (this.isRightPanelEnabled()){
            this.rightPanel.init();
        } else {
            Shell.$rightPanel.hide();
        }
    }

    dependencyLoaded(index: number, dep: any): void {
        if (index === 0) {
            window.THREE = dep; //https://github.com/mrdoob/three.js/issues/9602
        }
    }

    isLeftPanelEnabled(): boolean{
        return Utils.Bools.getBool(this.getData().config.options.leftPanelEnabled, true)
                && (this.helper.isMultiCanvas() || this.helper.isMultiSequence());
    }

    bookmark(): void {
        super.bookmark();

        const canvas: Manifesto.ICanvas = this.helper.getCurrentCanvas();
        const bookmark: Bookmark = new Bookmark();

        bookmark.index = this.helper.canvasIndex;
        bookmark.label = <string>Manifesto.TranslationCollection.getValue(canvas.getLabel());
        bookmark.path = this.getBookmarkUri();
        bookmark.thumb = canvas.getProperty('thumbnail');
        bookmark.title = this.helper.getLabel();
        bookmark.trackingLabel = window.trackingLabel;
        bookmark.type = manifesto.ElementType.physicalobject().toString();

        this.triggerSocket(BaseEvents.BOOKMARK, bookmark);
    }

    getEmbedScript(template: string, width: number, height: number): string{
        const configUri: string = this.getData().config.uri || '';
        const script: string = String.format(template, this.getSerializedLocales(), configUri, this.helper.iiifResourceUri, this.helper.collectionIndex, this.helper.manifestIndex, this.helper.sequenceIndex, this.helper.canvasIndex, width, height, this.getData().embedScriptUri);
        return script;
    }
}
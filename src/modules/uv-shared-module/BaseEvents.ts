export class BaseEvents {
  static ACCEPT_TERMS: string = "acceptTerms";
  static ANNOTATION_CANVAS_CHANGE: string = "annotationCanvasChange";
  static ANNOTATION_CHANGE: string = "annotationChange";
  static ANNOTATIONS_CLEARED: string = "annotationsCleared";
  static ANNOTATIONS_EMPTY: string = "annotationsEmpty";
  static ANNOTATIONS: string = "annotations";
  static BOOKMARK: string = "bookmark";
  static CANVAS_INDEX_CHANGE_FAILED: string = "canvasIndexChangeFailed";
  static CANVAS_INDEX_CHANGE: string = "canvasIndexChange";
  static CLEAR_ANNOTATIONS: string = "clearAnnotations";
  static CLICKTHROUGH: string = "clickthrough";
  static CLOSE_ACTIVE_DIALOGUE: string = "closeActiveDialogue";
  static CLOSE_LEFT_PANEL: string = "closeLeftPanel";
  static CLOSE_RIGHT_PANEL: string = "closeRightPanel";
  static COLLECTION_INDEX_CHANGE: string = "collectionIndexChange";
  static CREATE: string = "create";
  static CREATED: string = "created";
  static CURRENT_TIME_CHANGE: string = 'currentTimeChanged';
  static DOWN_ARROW: string = "downArrow";
  static DOWNLOAD: string = "download";
  static DROP: string = "drop";
  static END: string = "end";
  static ERROR: string = "error";
  static ESCAPE: string = "escape";
  static EXIT_FULLSCREEN: string = "exitFullScreen";
  static EXTERNAL_LINK_CLICKED: string = "externalLinkClicked";
  static EXTERNAL_RESOURCE_OPENED: string = "externalResourceOpened";
  static FEEDBACK: string = "feedback";
  static FIRST: string = "first";
  static FORBIDDEN: string = "forbidden";
  static GALLERY_DECREASE_SIZE: string = "galleryDecreaseSize";
  static GALLERY_INCREASE_SIZE: string = "galleryIncreaseSize";
  static GALLERY_THUMB_SELECTED: string = "galleryThumbSelected";
  static HIDE_AUTH_DIALOGUE = "hideAuthDialogue";
  static HIDE_CLICKTHROUGH_DIALOGUE: string = "hideClickthroughDialogue";
  static HIDE_DOWNLOAD_DIALOGUE: string = "hideDownloadDialogue";
  static HIDE_EMBED_DIALOGUE: string = "hideEmbedDialogue";
  static HIDE_EXTERNALCONTENT_DIALOGUE: string = "hideExternalContentDialogue";
  static HIDE_GENERIC_DIALOGUE: string = "hideGenericDialogue";
  static HIDE_HELP_DIALOGUE: string = "hideHelpDialogue";
  static HIDE_INFORMATION: string = "hideInformation";
  static HIDE_LOGIN_DIALOGUE: string = "hideLoginDialogue";
  static HIDE_MOREINFO_DIALOGUE: string = "hideMoreInfoDialogue";
  static HIDE_MULTISELECT_DIALOGUE: string = "hideMultiSelectDialogue";
  static HIDE_OVERLAY: string = "hideOverlay";
  static HIDE_RESTRICTED_DIALOGUE: string = "hideRestrictedDialogue";
  static HIDE_SETTINGS_DIALOGUE: string = "hideSettingsDialogue";
  static HIDE_SHARE_DIALOGUE: string = "hideShareDialogue";
  static HOME: string = "home";
  static LAST: string = "last";
  static LEFT_ARROW: string = "leftArrow";
  static LEFTPANEL_COLLAPSE_FULL_FINISH: string = "leftPanelCollapseFullFinish";
  static LEFTPANEL_COLLAPSE_FULL_START: string = "leftPanelCollapseFullStart";
  static LEFTPANEL_EXPAND_FULL_FINISH: string = "leftPanelExpandFullFinish";
  static LEFTPANEL_EXPAND_FULL_START: string = "leftPanelExpandFullStart";
  static LOAD: string = "load";
  static LOAD_FAILED: string = "loadFailed";
  static LOGIN_FAILED: string = "loginFailed";
  static LOGIN: string = "login";
  static LOGOUT: string = "logout";
  static MANIFEST_INDEX_CHANGE: string = "manifestIndexChange";
  static METRIC_CHANGE: string = "metricChange";
  static MINUS: string = "minus";
  static MULTISELECT_CHANGE: string = "multiSelectChange";
  static MULTISELECTION_MADE: string = "multiSelectionMade";
  static NEXT: string = "next";
  static NOT_FOUND: string = "notFound";
  static OPEN_EXTERNAL_RESOURCE: string = "openExternalResource";
  static OPEN_LEFT_PANEL: string = "openLeftPanel";
  static OPEN_RIGHT_PANEL: string = "openRightPanel";
  static OPEN_THUMBS_VIEW: string = "openThumbsView";
  static OPEN_TREE_VIEW: string = "openTreeView";
  static OPEN: string = "open";
  static PAGE_DOWN: string = "pageDown";
  static PAGE_UP: string = "pageUp";
  static PAUSE: string = 'pause';
  static PLUS: string = "plus";
  static PREV: string = "prev";
  static RANGE_CHANGE: string = "rangeChange";
  static REDIRECT: string = "redirect";
  static REFRESH: string = "refresh";
  static RELOAD: string = "reload";
  static RESIZE: string = "resize";
  static RESOURCE_DEGRADED: string = "resourceDegraded";
  static RETRY: string = "retry";
  static RETURN: string = "return";
  static RIGHT_ARROW: string = "rightArrow";
  static RIGHTPANEL_COLLAPSE_FULL_FINISH: string =
    "rightPanelCollapseFullFinish";
  static RIGHTPANEL_COLLAPSE_FULL_START: string = "rightPanelCollapseFullStart";
  static RIGHTPANEL_EXPAND_FULL_FINISH: string = "rightPanelExpandFullFinish";
  static RIGHTPANEL_EXPAND_FULL_START: string = "rightPanelExpandFullStart";
  static SET_ROTATION: string = "setRotation";
  static SET_TARGET: string = "setTarget";
  static SETTINGS_CHANGE: string = "settingsChange";
  static SHOW_AUTH_DIALOGUE: string = "showAuthDialogue";
  static SHOW_CLICKTHROUGH_DIALOGUE: string = "showClickThroughDialogue";
  static SHOW_DOWNLOAD_DIALOGUE: string = "showDownloadDialogue";
  static SHOW_EMBED_DIALOGUE: string = "showEmbedDialogue";
  static SHOW_EXTERNALCONTENT_DIALOGUE: string = "showExternalContentDialogue";
  static SHOW_GENERIC_DIALOGUE: string = "showGenericDialogue";
  static SHOW_HELP_DIALOGUE: string = "showHelpDialogue";
  static SHOW_INFORMATION: string = "showInformation";
  static SHOW_LOGIN_DIALOGUE: string = "showLoginDialogue";
  static SHOW_MESSAGE: string = "showMessage";
  static SHOW_MOREINFO_DIALOGUE: string = "showMoreInfoDialogue";
  static SHOW_MULTISELECT_DIALOGUE: string = "showMultiSelectDialogue";
  static SHOW_OVERLAY: string = "showOverlay";
  static SHOW_RESTRICTED_DIALOGUE: string = "showRestrictedDialogue";
  static SHOW_SETTINGS_DIALOGUE: string = "showSettingsDialogue";
  static SHOW_SHARE_DIALOGUE: string = "showShareDialogue";
  static SHOW_TERMS_OF_USE: string = "showTermsOfUse";
  static TARGET_CHANGE: string = "targetChange";
  static THUMB_MULTISELECTED: string = "thumbMultiSelected";
  static THUMB_SELECTED: string = "thumbSelected";
  static TOGGLE_EXPAND_LEFT_PANEL: string = "toggleExpandLeftPanel";
  static TOGGLE_EXPAND_RIGHT_PANEL: string = "toggleExpandRightPanel";
  static TOGGLE_FULLSCREEN: string = "toggleFullScreen";
  static TREE_NODE_MULTISELECTED: string = "treeNodeMultiSelected";
  static TREE_NODE_SELECTED: string = "treeNodeSelected";
  static UP_ARROW: string = "upArrow";
  static UPDATE_SETTINGS: string = "updateSettings";
  static VIEW_FULL_TERMS: string = "viewFullTerms";
  static WINDOW_UNLOAD: string = "windowUnload";
}

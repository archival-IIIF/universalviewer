class Commands {
    static namespace: string = 'seadragonExtension';

    static CLEAR_SEARCH: string                     = Commands.namespace + '.onClearSearch';
    static CURRENT_VIEW_URI: string                 = Commands.namespace + '.onCurrentViewUri';
    static FIRST: string                            = Commands.namespace + '.onFirst';
    static GALLERY_THUMB_SELECTED: string           = Commands.namespace + '.onGalleryThumbSelected';
    static IMAGE_SEARCH: string                     = Commands.namespace + '.onImageSearch';
    static LAST: string                             = Commands.namespace + '.onLast';
    static MODE_CHANGED: string                     = Commands.namespace + '.onModeChanged';
    static NEXT: string                             = Commands.namespace + '.onNext';
    static NEXT_SEARCH_RESULT: string               = Commands.namespace + '.onNextSearchResult';
    static OPEN_THUMBS_VIEW: string                 = Commands.namespace + '.onOpenThumbsView';
    static OPEN_TREE_VIEW: string                   = Commands.namespace + '.onOpenTreeView';
    static PAGE_SEARCH: string                      = Commands.namespace + '.onPageSearch';
    static PREV: string                             = Commands.namespace + '.onPrev';
    static PREV_SEARCH_RESULT: string               = Commands.namespace + '.onPrevSearchResult';
    static SEADRAGON_ANIMATION: string              = Commands.namespace + '.onAnimation';
    static SEADRAGON_ANIMATION_FINISH: string       = Commands.namespace + '.onAnimationfinish';
    static SEADRAGON_ANIMATION_START: string        = Commands.namespace + '.onAnimationStart';
    static SEADRAGON_OPEN: string                   = Commands.namespace + '.onOpen';
    static SEADRAGON_RESIZE: string                 = Commands.namespace + '.onResize';
    static SEADRAGON_ROTATION: string               = Commands.namespace + '.onRotation';
    static SEARCH: string                           = Commands.namespace + '.onSearch';
    static SEARCH_RESULTS: string                   = Commands.namespace + '.onSearchResults';
    static SEARCH_RESULTS_EMPTY: string             = Commands.namespace + '.onSearchResultsEmpty';
    static TREE_NODE_SELECTED: string               = Commands.namespace + '.onTreeNodeSelected';
    static VIEW_PAGE: string                        = Commands.namespace + '.onViewPage';
}

export = Commands;
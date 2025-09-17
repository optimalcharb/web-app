/** @jsxImportSource preact */
import { h, Fragment, FunctionalComponent } from 'preact';

// embedpdf for preact
import { EmbedPDF } from '@embedpdf/core/preact';
import { createPluginRegistration } from '@embedpdf/core';
import { usePdfiumEngine } from '@embedpdf/engines/preact';
import {
  AllLogger,
  ConsoleLogger,
  ignore,
  PdfAnnotationSubtype,
  PdfBlendMode,
  PerfLogger,
  uuidV4,
} from '@embedpdf/models';

// embedpdf plugins
import {
  AnnotationLayer,
  ANNOTATION_PLUGIN_ID,
  AnnotationPlugin,
  AnnotationPluginPackage,
  AnnotationState,
  getToolDefaultsBySubtypeAndIntent,
  makeVariantKey,
} from '@embedpdf/plugin-annotation/preact';
import {
  EXPORT_PLUGIN_ID,
  ExportPlugin,
  ExportPluginPackage,
} from '@embedpdf/plugin-export/preact';
import {
  HISTORY_PLUGIN_ID,
  HistoryPlugin,
  HistoryPluginPackage,
  HistoryState,
} from '@embedpdf/plugin-history/preact';
import {
  GlobalPointerProvider,
  PagePointerProvider,
  INTERACTION_MANAGER_PLUGIN_ID,
  InteractionManagerPlugin,
  InteractionManagerPluginPackage,
  InteractionManagerState,
} from '@embedpdf/plugin-interaction-manager/preact';
import { LoaderPluginPackage } from '@embedpdf/plugin-loader/preact';
import {
  PluginUIProvider,
  MenuItem,
  defineComponent,
  GlobalStoreState,
  UIComponentType,
  UIPlugin,
  UIPluginConfig,
  UIPluginPackage,
  isActive,
  UI_PLUGIN_ID,
  isDisabled,
  getIconProps,
} from '@embedpdf/plugin-ui/preact';
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/preact';
import {
  Scroller,
  SCROLL_PLUGIN_ID,
  ScrollPlugin,
  ScrollPluginPackage,
  ScrollState,
  ScrollStrategy,
} from '@embedpdf/plugin-scroll/preact';
import {
  SearchLayer,
  SEARCH_PLUGIN_ID,
  SearchPluginPackage,
  SearchState,
} from '@embedpdf/plugin-search/preact';
import {
  SelectionLayer,
  SELECTION_PLUGIN_ID,
  SelectionPlugin,
  SelectionPluginPackage,
  SelectionState,
} from '@embedpdf/plugin-selection/preact';
import { ThumbnailPluginPackage } from '@embedpdf/plugin-thumbnail/preact';
import { TilingLayer, TilingPluginPackage } from '@embedpdf/plugin-tiling/preact';
import {
  Viewport,
  VIEWPORT_PLUGIN_ID,
  ViewportPluginPackage,
  ViewportState,
} from '@embedpdf/plugin-viewport/preact';
import {
  PinchWrapper,
  MarqueeZoom,
  ZOOM_PLUGIN_ID,
  ZoomPlugin,
  ZoomPluginPackage,
  ZoomState,
  ZoomMode,
} from '@embedpdf/plugin-zoom/preact';

// import from files
import { AnnotationMenu } from './components/annotation-menu';
import { HintLayer } from './components/hint-layer';
import { LoadingIndicator } from './components/ui/loading-indicator';
import {
  commandMenuRenderer,
  groupedItemsRenderer,
  headerRenderer,
  iconButtonRenderer,
  leftPanelMainRenderer,
  LeftPanelMainProps,
  pageControlsContainerRenderer,
  PageControlsProps,
  pageControlsRenderer,
  panelRenderer,
  searchRenderer,
  selectButtonRenderer,
  textSelectionMenuRenderer,
  thumbnailsRender,
  zoomRenderer,
  ZoomRendererProps,
} from './components/renderers';

import { PDFContainerConfig } from './pdf-container-config';

// save states of each plugin
type State = GlobalStoreState<{
  [ZOOM_PLUGIN_ID]: ZoomState;
  [VIEWPORT_PLUGIN_ID]: ViewportState;
  [SCROLL_PLUGIN_ID]: ScrollState;
  [SEARCH_PLUGIN_ID]: SearchState;
  [SELECTION_PLUGIN_ID]: SelectionState;
  [ANNOTATION_PLUGIN_ID]: AnnotationState;
  [INTERACTION_MANAGER_PLUGIN_ID]: InteractionManagerState;
  [HISTORY_PLUGIN_ID]: HistoryState;
}>;

export const menuItems: Record<string, MenuItem<State>> = {
  download: {
    id: 'download',
    icon: 'download',
    label: 'Download',
    type: 'action',
    action: (registry) => {
      const exportPlugin = registry.getPlugin<ExportPlugin>(EXPORT_PLUGIN_ID)?.provides();
      if (exportPlugin) {
        exportPlugin.download();
      }
    },
  },
  zoom: {
    id: 'zoom',
    icon: 'zoomIn',
    label: 'Zoom Controls',
    type: 'menu',
    children: ['changeZoomLevel'],
    active: (storeState) => storeState.plugins.ui.commandMenu.commandMenu.activeCommand === 'zoom',
  },
  changeZoomLevel: {
    id: 'changeZoomLevel',
    label: (storeState) =>
      `Zoom level (${(storeState.plugins.zoom.currentZoomLevel * 100).toFixed(0)}%)`,
    type: 'menu',
    children: [
      'zoom50',
      'zoom100',
      'zoom150',
      'zoom200',
    ],
    active: (storeState) =>
      storeState.plugins.ui.commandMenu.commandMenu.activeCommand === 'changeZoomLevel',
  },
  zoom50: {
    id: 'zoom50',
    label: '50%',
    type: 'action',
    active: (storeState) => storeState.plugins.zoom.currentZoomLevel === 0.5,
    action: (registry) => {
      const zoom = registry.getPlugin<ZoomPlugin>(ZOOM_PLUGIN_ID)?.provides();

      if (zoom) {
        zoom.requestZoom(0.5);
      }
    },
  },
  zoom100: {
    id: 'zoom100',
    label: '100%',
    type: 'action',
    active: (storeState) => storeState.plugins.zoom.currentZoomLevel === 1,
    action: (registry) => {
      const zoom = registry.getPlugin<ZoomPlugin>(ZOOM_PLUGIN_ID)?.provides();

      if (zoom) {
        zoom.requestZoom(1);
      }
    },
  },
  zoom150: {
    id: 'zoom150',
    label: '150%',
    type: 'action',
    active: (storeState) => storeState.plugins.zoom.currentZoomLevel === 1.5,
    action: (registry) => {
      const zoom = registry.getPlugin<ZoomPlugin>(ZOOM_PLUGIN_ID)?.provides();

      if (zoom) {
        zoom.requestZoom(1.5);
      }
    },
  },
  zoom200: {
    id: 'zoom200',
    label: '200%',
    type: 'action',
    active: (storeState) => storeState.plugins.zoom.currentZoomLevel === 2,
    action: (registry) => {
      const zoom = registry.getPlugin<ZoomPlugin>(ZOOM_PLUGIN_ID)?.provides();

      if (zoom) {
        zoom.requestZoom(2);
      }
    },
  },
  zoomIn: {
    id: 'zoomIn',
    label: 'Zoom in',
    icon: 'zoomIn',
    type: 'action',
    action: (registry) => {
      const zoom = registry.getPlugin<ZoomPlugin>(ZOOM_PLUGIN_ID)?.provides();

      if (zoom) {
        zoom.zoomIn();
      }
    },
  },
  zoomOut: {
    id: 'zoomOut',
    label: 'Zoom out',
    icon: 'zoomOut',
    type: 'action',
    action: (registry) => {
      const zoom = registry.getPlugin<ZoomPlugin>(ZOOM_PLUGIN_ID)?.provides();

      if (zoom) {
        zoom.zoomOut();
      }
    },
  },
  search: {
    id: 'search',
    label: 'Search',
    icon: 'search',
    type: 'action',
    action: (registry) => {
      const ui = registry.getPlugin<UIPlugin>(UI_PLUGIN_ID)?.provides();

      if (ui) {
        ui.togglePanel({ id: 'rightPanel', visibleChild: 'search' });
      }
    },
    active: (storeState) =>
      storeState.plugins.ui.panel.rightPanel.open === true &&
      storeState.plugins.ui.panel.rightPanel.visibleChild === 'search',
  },
  sidebar: {
    id: 'sidebar',
    label: 'Sidebar',
    icon: 'sidebar',
    type: 'action',
    action: (registry, state) => {
      const ui = registry.getPlugin<UIPlugin>(UI_PLUGIN_ID)?.provides();

      if (ui) {
        ui.togglePanel({
          id: 'leftPanel',
          visibleChild: 'leftPanelMain',
          open:
            state.plugins.ui.panel.leftPanel.open === true &&
            state.plugins.ui.panel.leftPanel.visibleChild === 'leftPanelMain'
              ? false
              : true,
        });
      }
    },
    active: (storeState) =>
      storeState.plugins.ui.panel.leftPanel.open === true &&
      storeState.plugins.ui.panel.leftPanel.visibleChild === 'leftPanelMain',
  },
  nextPage: {
    id: 'nextPage',
    label: 'Next page',
    icon: 'chevronRight',
    type: 'action',
    action: (registry) => {
      const scroll = registry.getPlugin<ScrollPlugin>(SCROLL_PLUGIN_ID)?.provides();

      if (scroll) {
        scroll.scrollToNextPage();
      }
    },
  },
  previousPage: {
    id: 'previousPage',
    label: 'Previous page',
    icon: 'chevronLeft',
    type: 'action',
    action: (registry) => {
      const scroll = registry.getPlugin<ScrollPlugin>(SCROLL_PLUGIN_ID)?.provides();

      if (scroll) {
        scroll.scrollToPreviousPage();
      }
    },
  },
  copy: {
    id: 'copy',
    label: 'Copy',
    icon: 'copy',
    type: 'action',
    action: (registry) => {
      const selection = registry.getPlugin<SelectionPlugin>(SELECTION_PLUGIN_ID)?.provides();
      if (selection) {
        selection.copyToClipboard();
      }
    },
  },
  highlight: {
    id: 'highlight',
    label: 'Highlight',
    type: 'action',
    icon: 'highlight',
    iconProps: (storeState) => ({
      primaryColor: getToolDefaultsBySubtypeAndIntent(
        storeState.plugins.annotation,
        PdfAnnotationSubtype.HIGHLIGHT,
      ).color,
    }),
    action: (registry, state) => {
      const annotation = registry.getPlugin<AnnotationPlugin>(ANNOTATION_PLUGIN_ID)?.provides();
      if (annotation) {
        if (
          state.plugins.annotation.activeVariant === makeVariantKey(PdfAnnotationSubtype.HIGHLIGHT)
        ) {
          annotation.setActiveVariant(null);
        } else {
          annotation.setActiveVariant(makeVariantKey(PdfAnnotationSubtype.HIGHLIGHT));
        }
      }
    },
    active: (storeState) =>
      storeState.plugins.annotation.activeVariant ===
      makeVariantKey(PdfAnnotationSubtype.HIGHLIGHT),
  },
  highlightSelection: {
    id: 'highlightSelection',
    label: 'Highlight Selection',
    type: 'action',
    icon: 'highlight',
    iconProps: (storeState) => ({
      primaryColor: getToolDefaultsBySubtypeAndIntent(
        storeState.plugins.annotation,
        PdfAnnotationSubtype.HIGHLIGHT,
      ).color,
    }),
    action: (registry) => {
      const annotation = registry.getPlugin<AnnotationPlugin>(ANNOTATION_PLUGIN_ID)?.provides();
      const selection = registry.getPlugin<SelectionPlugin>(SELECTION_PLUGIN_ID)?.provides();
      if (!selection || !annotation) return;

      const defaultSettings = annotation.getToolDefaultsBySubtype(PdfAnnotationSubtype.HIGHLIGHT);
      const formattedSelection = selection.getFormattedSelection();
      const selectionText = selection.getSelectedText();

      for (const sel of formattedSelection) {
        selectionText.wait((text) => {
          const annotationId = uuidV4();
          annotation.createAnnotation(sel.pageIndex, {
            id: annotationId,
            created: new Date(),
            type: PdfAnnotationSubtype.HIGHLIGHT,
            blendMode: PdfBlendMode.Multiply,
            color: defaultSettings.color,
            opacity: defaultSettings.opacity,
            pageIndex: sel.pageIndex,
            rect: sel.rect,
            segmentRects: sel.segmentRects,
            custom: {
              text: text.join('\n'),
            },
          });
          annotation.selectAnnotation(sel.pageIndex, annotationId);
        }, ignore);
      }
    },
  },
  undo: {
    id: 'undo',
    label: 'Undo',
    type: 'action',
    icon: 'arrowBackUp',
    action: (registry) => {
      const history = registry.getPlugin<HistoryPlugin>(HISTORY_PLUGIN_ID)?.provides();
      if (history) {
        history.undo();
      }
    },
    disabled: (storeState) => {
      const history = storeState.plugins[HISTORY_PLUGIN_ID];
      return !history.global.canUndo;
    },
  },
  redo: {
    id: 'redo',
    label: 'Redo',
    type: 'action',
    icon: 'arrowForwardUp',
    action: (registry) => {
      const history = registry.getPlugin<HistoryPlugin>(HISTORY_PLUGIN_ID)?.provides();
      if (history) {
        history.redo();
      }
    },
    disabled: (storeState) => {
      const history = storeState.plugins[HISTORY_PLUGIN_ID];
      return !history.global.canRedo;
    },
  },
};

// Define components
export const components: Record<string, UIComponentType<State>> = {
  downloadButton: {
    type: 'iconButton',
    id: 'downloadButton',
    props: {
      commandId: 'download',
      active: false,
      label: 'Download',
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      active: isActive(menuItems.download, storeState),
    }),
  },
  undoButton: {
    type: 'iconButton',
    id: 'undoButton',
    props: {
      commandId: 'undo',
      disabled: false,
      label: 'Undo',
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      disabled: isDisabled(menuItems.undo, storeState),
    }),
  },
  redoButton: {
    type: 'iconButton',
    id: 'redoButton',
    props: {
      commandId: 'redo',
      disabled: false,
      label: 'Redo',
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      disabled: isDisabled(menuItems.redo, storeState),
    }),
  },
  copyButton: {
    type: 'iconButton',
    id: 'copyButton',
    props: {
      commandId: 'copy',
      active: false,
      label: 'Copy',
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      active: isActive(menuItems.copy, storeState),
    }),
  },
  highlightButton: {
    type: 'iconButton',
    id: 'highlightButton',
    props: {
      commandId: 'highlight',
      active: false,
      label: 'Highlight',
      color: '#ffcd45',
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      active: isActive(menuItems.highlight, storeState),
      iconProps: getIconProps(menuItems.highlight, storeState),
    }),
  },
  highlightSelectionButton: {
    type: 'iconButton',
    id: 'highlightSelectionButton',
    props: {
      commandId: 'highlightSelection',
      color: '#ffcd45',
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      iconProps: getIconProps(menuItems.highlightSelection, storeState),
    }),
  },
  searchButton: {
    type: 'iconButton',
    id: 'searchButton',
    props: {
      active: false,
      commandId: 'search',
      label: 'Search',
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      active: isActive(menuItems.search, storeState),
    }),
  },
  zoomButton: {
    type: 'iconButton',
    id: 'zoomButton',
    props: {
      commandId: 'zoom',
      label: 'Zoom',
      img: 'data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiAgd2lkdGg9IjI0IiAgaGVpZ2h0PSIyNCIgIHZpZXdCb3g9IjAgMCAyNCAyNCIgIGZpbGw9Im5vbmUiICBzdHJva2U9IiMzNDNhNDAiICBzdHJva2Utd2lkdGg9IjIiICBzdHJva2UtbGluZWNhcD0icm91bmQiICBzdHJva2UtbGluZWpvaW49InJvdW5kIiAgY2xhc3M9Imljb24gaWNvbi10YWJsZXIgaWNvbnMtdGFibGVyLW91dGxpbmUgaWNvbi10YWJsZXItY2lyY2xlLXBsdXMiPjxwYXRoIHN0cm9rZT0ibm9uZSIgZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zIDEyYTkgOSAwIDEgMCAxOCAwYTkgOSAwIDAgMCAtMTggMCIgLz48cGF0aCBkPSJNOSAxMmg2IiAvPjxwYXRoIGQ9Ik0xMiA5djYiIC8+PC9zdmc+',
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      active:
        isActive(menuItems.zoom, storeState) || isActive(menuItems.changeZoomLevel, storeState),
    }),
  },
  sidebarButton: {
    type: 'iconButton',
    id: 'sidebarButton',
    props: {
      commandId: 'sidebar',
      label: 'Sidebar',
      active: false,
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      active: isActive(menuItems.sidebar, storeState),
    }),
  },
  headerStart: {
    id: 'headerStart',
    type: 'groupedItems',
    slots: [
      { componentId: 'downloadButton', priority: 1 },
      { componentId: 'sidebarButton', priority: 2 },
      {
        componentId: 'zoomButton',
        priority: 7,
        className: 'hidden @min-[400px]:block @min-[600px]:hidden',
      },
      { componentId: 'zoom', priority: 8, className: 'hidden @min-[600px]:block' },
    ],
    props: {
      gap: 10,
    },
  },
  headerCenter: {
    id: 'headerCenter',
    type: 'groupedItems',
    slots: [
      { componentId: 'highlightButton', priority: 0 },
      { componentId: 'undoButton', priority: 3 },
      { componentId: 'redoButton', priority: 4 },
    ],
    props: {
      gap: 10,
    },
  },
  headerEnd: {
    id: 'headerEnd',
    type: 'groupedItems',
    slots: [
      { componentId: 'searchButton', priority: 1 },
    ],
    props: {
      gap: 10,
    },
  },
  pageControls: defineComponent<
    { currentPage: number; pageCount: number },
    PageControlsProps,
    State
  >()({
    id: 'pageControls',
    type: 'custom',
    render: 'pageControls',
    initialState: {
      currentPage: 1,
      pageCount: 1,
    },
    props: (initialState) => ({
      currentPage: initialState.currentPage,
      pageCount: initialState.pageCount,
      nextPageCommandId: 'nextPage',
      previousPageCommandId: 'previousPage',
    }),
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      currentPage: storeState.plugins.scroll.currentPage,
      pageCount: (storeState.core.document as { pageCount?: number })?.pageCount ?? 1,
    }),
  }),
  pageControlsContainer: {
    id: 'pageControlsContainer',
    type: 'floating',
    props: {
      scrollerPosition: 'outside',
    },
    render: 'pageControlsContainer',
    slots: [{ componentId: 'pageControls', priority: 0 }],
  },
  textSelectionMenuButtons: {
    id: 'textSelectionMenuButtons',
    type: 'groupedItems',
    slots: [
      { componentId: 'copyButton', priority: 0 },
      { componentId: 'highlightSelectionButton', priority: 1 },
    ],
    props: {
      gap: 10,
    },
  },
  textSelectionMenu: {
    id: 'textSelectionMenu',
    type: 'floating',
    render: 'textSelectionMenu',
    props: {
      open: false,
      scrollerPosition: 'inside',
    },
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      isScrolling: storeState.plugins.viewport.isScrolling,
      scale: storeState.core.scale,
      open:
        storeState.plugins[SELECTION_PLUGIN_ID].active &&
        !storeState.plugins[SELECTION_PLUGIN_ID].selecting,
    }),
    slots: [{ componentId: 'textSelectionMenuButtons', priority: 0 }],
    getChildContext: {
      direction: 'horizontal',
    },
  },
  topHeader: {
    type: 'header',
    id: 'topHeader',
    slots: [
      { componentId: 'headerStart', priority: 0 },
      { componentId: 'headerCenter', priority: 1 },
      { componentId: 'headerEnd', priority: 2 },
    ],
    getChildContext: (props) => ({
      direction:
        props.placement === 'top' || props.placement === 'bottom' ? 'horizontal' : 'vertical',
    }),
    props: {
      placement: 'top',
      style: {
        backgroundColor: '#ffffff',
        gap: '10px',
      },
    },
  },
  leftPanelMain: defineComponent<{ visibleChild: string }, LeftPanelMainProps, State>()({
    id: 'leftPanelMain',
    type: 'custom',
    render: 'leftPanelMain',
    initialState: {
      visibleChild: 'thumbnails',
    },
    props: (initialState) => ({
      visibleChild: initialState.visibleChild,
      tabsCommandId: '',
    }),
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      visibleChild: storeState.plugins.ui.custom.leftPanelMain.visibleChild,
    }),
    slots: [
      { componentId: 'thumbnails', priority: 0 },
    ],
  }),
  leftPanel: {
    id: 'leftPanel',
    type: 'panel',
    initialState: {
      open: false,
      visibleChild: 'leftPanelMain',
    },
    props: (initialState) => ({
      open: initialState.open,
      visibleChild: initialState.visibleChild,
      location: 'left',
    }),
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      open: storeState.plugins.ui.panel.leftPanel.open,
      visibleChild: storeState.plugins.ui.panel.leftPanel.visibleChild,
    }),
    slots: [
      { componentId: 'leftPanelMain', priority: 0 },
      { componentId: 'leftPanelAnnotationStyle', priority: 1 },
    ],
  },
  thumbnails: {
    id: 'thumbnails',
    type: 'custom',
    render: 'thumbnails',
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      currentPage: storeState.plugins.scroll.currentPage,
    }),
  },
  search: {
    id: 'search',
    type: 'custom',
    render: 'search',
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      flags: storeState.plugins.search.flags,
      results: storeState.plugins.search.results,
      total: storeState.plugins.search.total,
      activeResultIndex: storeState.plugins.search.activeResultIndex,
      active: storeState.plugins.search.active,
      query: storeState.plugins.search.query,
      loading: storeState.plugins.search.loading,
    }),
  },
  commandMenu: {
    id: 'commandMenu',
    type: 'commandMenu',
    initialState: {
      open: false,
      activeCommand: null,
      triggerElement: undefined,
      position: undefined,
      flatten: false,
    },
    props: (initialState) => ({
      open: initialState.open,
      activeCommand: initialState.activeCommand,
      triggerElement: initialState.triggerElement,
      position: initialState.position,
      flatten: initialState.flatten,
    }),
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      open: storeState.plugins.ui.commandMenu.commandMenu.open,
      activeCommand: storeState.plugins.ui.commandMenu.commandMenu.activeCommand,
      triggerElement: storeState.plugins.ui.commandMenu.commandMenu.triggerElement,
      position: storeState.plugins.ui.commandMenu.commandMenu.position as 'top' | 'bottom' | 'left' | 'right' | undefined,
      flatten: storeState.plugins.ui.commandMenu.commandMenu.flatten,
    }),
  },
  zoom: defineComponent<{ zoomLevel: number }, ZoomRendererProps, State>()({
    id: 'zoom',
    type: 'custom',
    render: 'zoom',
    initialState: {
      zoomLevel: 1,
    },
    props: (initialState) => ({
      zoomLevel: initialState.zoomLevel,
      commandZoomIn: menuItems.zoomIn.id,
      commandZoomOut: menuItems.zoomOut.id,
      commandZoomMenu: menuItems.zoom.id,
      zoomMenuActive: false,
    }),
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      zoomLevel: storeState.plugins.zoom.currentZoomLevel,
      zoomMenuActive: isActive(menuItems.zoom, storeState) || isActive(menuItems.changeZoomLevel, storeState),
    }),
  }),
  rightPanel: {
    id: 'rightPanel',
    type: 'panel',
    initialState: {
      open: false,
      visibleChild: null,
    },
    props: (initialState) => ({
      open: initialState.open,
      visibleChild: initialState.visibleChild,
      location: 'right',
    }),
    mapStateToProps: (storeState, ownProps) => ({
      ...ownProps,
      open: storeState.plugins.ui.panel.rightPanel.open,
      visibleChild: storeState.plugins.ui.panel.rightPanel.visibleChild,
    }),
    slots: [
      { componentId: 'search', priority: 0 },
    ],
  },
};

// Embedpdf UIPlugin config
const uiConfig: UIPluginConfig = {
  enabled: true,
  components,
  menuItems,
};

const pluginConfigs = {
  scroll: {
    strategy: ScrollStrategy.Vertical,
  },
  thumbnail: {
    width: 150,
    gap: 10,
    buffer: 3,
    labelHeight: 30,
  },
  tiling: {
    tileSize: 768,
    overlapPx: 2.5,
    extraRings: 0,
  },
  viewport: {
    viewportGap: 10,
  },
  zoom: {
    defaultZoomLevel: ZoomMode.FitPage,
  },
};

interface PDFContainerProps {
  config: PDFContainerConfig;
}

const logger = new AllLogger([new ConsoleLogger(), new PerfLogger()]);

export const PDFContainerPreact: FunctionalComponent<PDFContainerProps> = ({ config }) => {
  // Use engine to load pdf
  const { engine, isLoading } = usePdfiumEngine({
    worker: true,
    logger: logger,
  });

  // Loading screen
  if (!engine || isLoading)
    return (
      <>
        <div className="flex h-full w-full items-center justify-center">
          <LoadingIndicator size="lg" text="Initializing PDF engine..." />
        </div>
      </>
    );

  // Main pdfviewer component
  return (
    <>
      <EmbedPDF
        logger={logger}
        engine={engine}
        onInitialized={async (registry) => {
          const uiCapability = registry.getPlugin<UIPlugin>('ui')?.provides();

          if (uiCapability) {
            uiCapability.registerComponentRenderer('groupedItems', groupedItemsRenderer);
            uiCapability.registerComponentRenderer('iconButton', iconButtonRenderer);
            uiCapability.registerComponentRenderer('header', headerRenderer);
            uiCapability.registerComponentRenderer('panel', panelRenderer);
            uiCapability.registerComponentRenderer('search', searchRenderer);
            uiCapability.registerComponentRenderer('zoom', zoomRenderer);
            uiCapability.registerComponentRenderer(
              'pageControlsContainer',
              pageControlsContainerRenderer,
            );
            uiCapability.registerComponentRenderer('pageControls', pageControlsRenderer);
            uiCapability.registerComponentRenderer('commandMenu', commandMenuRenderer);
            uiCapability.registerComponentRenderer('thumbnails', thumbnailsRender);
            uiCapability.registerComponentRenderer('selectButton', selectButtonRenderer);
            uiCapability.registerComponentRenderer('textSelectionMenu', textSelectionMenuRenderer);
            uiCapability.registerComponentRenderer('leftPanelMain', leftPanelMainRenderer);
          }
        }}
        plugins={[
          createPluginRegistration(UIPluginPackage, uiConfig),
          createPluginRegistration(LoaderPluginPackage, {
            loadingOptions: {
              type: 'url',
              pdfFile: {
                id: 'pdf',
                name: 'annotated.pdf',
                url: config.url,
              },
            },
          }),
          createPluginRegistration(ViewportPluginPackage, pluginConfigs.viewport),
          createPluginRegistration(ScrollPluginPackage, pluginConfigs.scroll),
          createPluginRegistration(ZoomPluginPackage, pluginConfigs.zoom),
          createPluginRegistration(RenderPluginPackage),
          createPluginRegistration(SearchPluginPackage),
          createPluginRegistration(SelectionPluginPackage),
          createPluginRegistration(TilingPluginPackage, pluginConfigs.tiling),
          createPluginRegistration(ThumbnailPluginPackage, pluginConfigs.thumbnail),
          createPluginRegistration(AnnotationPluginPackage),
          createPluginRegistration(ExportPluginPackage),
          createPluginRegistration(InteractionManagerPluginPackage),
          createPluginRegistration(HistoryPluginPackage),
        ]}
      >
        {({ pluginsReady }) => (
          <PluginUIProvider>
            {({ headers, panels, floating, commandMenu }) => (
              <>
                <div className="@container relative flex h-full w-full select-none flex-col">
                  {headers.top.length > 0 && <div>{headers.top}</div>}
                  <div className="flex flex-1 flex-row overflow-hidden">
                    <div className="flex flex-col">{headers.left}</div>
                    <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
                      {panels.left.length > 0 && <Fragment>{panels.left}</Fragment>}
                      <div className="relative flex w-full flex-1 overflow-hidden">
                        <GlobalPointerProvider>
                          <Viewport
                            style={{
                              width: '100%',
                              height: '100%',
                              flexGrow: 1,
                              backgroundColor: '#f1f3f5',
                              overflow: 'auto',
                            }}
                          >
                            {!pluginsReady && (
                              <div className="flex h-full w-full items-center justify-center">
                                <LoadingIndicator size="lg" text="Loading PDF document..." />
                              </div>
                            )}
                            {pluginsReady && (
                              <PinchWrapper>
                                <Scroller
                                  renderPage={({
                                    pageIndex,
                                    scale,
                                    width,
                                    height,
                                  }) => (
                                      <PagePointerProvider
                                        rotation={0}
                                        scale={scale}
                                        pageWidth={width}
                                        pageHeight={height}
                                        pageIndex={pageIndex}
                                      >
                                        <RenderLayer
                                          pageIndex={pageIndex}
                                          className="pointer-events-none"
                                        />
                                        <TilingLayer
                                          pageIndex={pageIndex}
                                          scale={scale}
                                          className="pointer-events-none"
                                        />
                                        <SearchLayer
                                          pageIndex={pageIndex}
                                          scale={scale}
                                          className="pointer-events-none"
                                        />
                                        <HintLayer />
                                        <AnnotationLayer
                                          pageIndex={pageIndex}
                                          scale={scale}
                                          pageWidth={width}
                                          pageHeight={height}
                                          rotation={0}
                                          selectionMenu={({
                                            selected,
                                            rect,
                                            annotation,
                                            menuWrapperProps,
                                          }) => (
                                            <div
                                              {...menuWrapperProps}
                                              style={{
                                                ...menuWrapperProps.style,
                                                display: 'flex',
                                                justifyContent: 'center',
                                              }}
                                            >
                                              {selected ? (
                                                <AnnotationMenu
                                                  trackedAnnotation={annotation}
                                                  style={{
                                                    pointerEvents: 'auto',
                                                    position: 'absolute',
                                                    top: rect.size.height + 10,
                                                  }}
                                                />
                                              ) : null}
                                            </div>
                                          )}
                                        />
                                        <MarqueeZoom pageIndex={pageIndex} scale={scale} />
                                        <SelectionLayer pageIndex={pageIndex} scale={scale} />
                                      </PagePointerProvider>
                                  )}
                                  overlayElements={floating.insideScroller}
                                />
                              </PinchWrapper>
                            )}
                            {floating.outsideScroller}
                          </Viewport>
                        </GlobalPointerProvider>
                      </div>
                      {panels.right.length > 0 && <Fragment>{panels.right}</Fragment>}
                    </div>
                    <div className="flex flex-col">{headers.right}</div>
                  </div>
                  {headers.bottom.length > 0 && <div>{headers.bottom}</div>}
                  {commandMenu}
                </div>
              </>
            )}
          </PluginUIProvider>
        )}
      </EmbedPDF>
    </>
  );
}


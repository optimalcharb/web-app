import { ArrowBackUpIcon } from './arrow-back-up';
import { ArrowForwardUpIcon } from './arrow-forward-up';
import { ChevronDownIcon } from './chevron-down';
import { ChevronLeftIcon } from './chevron-left';
import { ChevronRightIcon } from './chevron-right';
import { CopyIcon } from './copy';
import { DownloadIcon } from './download';
import { HighlightIcon } from './highlight';
import { IconComponent } from './types';
import { MenuIcon } from './menu';
import { SearchIcon } from './search';
import { SidebarIcon } from './sidebar';
import { TrashIcon } from './trash';
import { XIcon } from './x';
import { ZoomInIcon } from './zoom-in';
import { ZoomInAreaIcon } from './zoom-in-area';
import { ZoomOutIcon } from './zoom-out';

export type Icons = {
  [key: string]: IconComponent;
};

export const icons: Icons = {
  arrowBackUp: ArrowBackUpIcon,
  arrowForwardUp: ArrowForwardUpIcon,
  chevronDown: ChevronDownIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  copy: CopyIcon,
  download: DownloadIcon,
  highlight: HighlightIcon,
  menu: MenuIcon,
  search: SearchIcon,
  sidebar: SidebarIcon,
  trash: TrashIcon,
  x: XIcon,
  zoomIn: ZoomInIcon,
  zoomInArea: ZoomInAreaIcon,
  zoomOut: ZoomOutIcon,
};

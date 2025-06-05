import {EyeIcon} from "@heroicons/react/24/outline";
import {Bars3Icon} from "@heroicons/react/24/outline";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {ChevronDownIcon} from "@heroui/shared-icons";
import {PaperAirplaneIcon} from "@heroicons/react/24/outline";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {FaceFrownIcon} from "@heroicons/react/24/outline";
import {XMarkIcon} from "@heroicons/react/24/outline";
import Ghost from "@components/Icons/svg/Ghost";
import Party from "@components/Icons/svg/Party";
import {BriefcaseIcon} from "@heroicons/react/24/solid";
import {CogIcon} from "@heroicons/react/24/solid";
import {InformationCircleIcon} from "@heroicons/react/24/solid";
import {PlusCircleIcon} from "@heroicons/react/24/solid";
import {PencilSquareIcon} from "@heroicons/react/24/solid";
import {ArchiveBoxArrowDownIcon} from "@heroicons/react/24/solid";
import {ArchiveBoxXMarkIcon} from "@heroicons/react/24/solid";
import {NewspaperIcon} from "@heroicons/react/24/solid";
import {ChatBubbleLeftEllipsisIcon} from "@heroicons/react/24/outline";
import {ArrowLeftIcon} from "@heroicons/react/24/solid";
import {ArrowRightIcon} from "@heroicons/react/24/solid";
import {ChevronRightIcon} from "@heroicons/react/24/solid";
import {MapPinIcon} from "@heroicons/react/24/solid";
import {BuildingOffice2Icon} from "@heroicons/react/24/solid";
import {ArrowTopRightOnSquareIcon} from "@heroicons/react/24/solid";
import {CubeTransparentIcon} from "@heroicons/react/24/solid";
import {CubeIcon} from "@heroicons/react/24/solid";
import GitHub from "./svg/GitHub";
import {ArrowDownOnSquareStackIcon} from "@heroicons/react/24/solid";
import {ArrowUpOnSquareStackIcon} from "@heroicons/react/24/solid";
import {TrashIcon} from "@heroicons/react/24/solid";
import {SunIcon} from "@heroicons/react/24/solid";
import {MoonIcon} from "@heroicons/react/24/solid";
import {UserIcon} from "@heroicons/react/24/solid";
import {PhotoIcon} from "@heroicons/react/24/solid";
import {XCircleIcon} from "@heroicons/react/24/solid";

const Icons = {
    default: CubeTransparentIcon,
    addEvent: PlusCircleIcon,
    archive: ArchiveBoxArrowDownIcon,
    arrowBack: ArrowLeftIcon,
    arrowForward: ArrowRightIcon,
    arrowNext: ChevronRightIcon,
    chevronDown: ChevronDownIcon,
    company: BuildingOffice2Icon,
    edit: PencilSquareIcon,
    externalLink: ArrowTopRightOnSquareIcon,
    ghosted: Ghost,
    gotOffer: Party,
    info: InformationCircleIcon,
    inProgress: ArrowPathIcon,
    jobsList: BriefcaseIcon,
    location: MapPinIcon,
    menu: Bars3Icon,
    noteField: ChatBubbleLeftEllipsisIcon,
    rejected: FaceFrownIcon,
    restore: ArchiveBoxXMarkIcon,
    seeMore: EyeIcon,
    search: MagnifyingGlassIcon,
    sent: PaperAirplaneIcon,
    settings: CogIcon,
    updateStatus: NewspaperIcon,
    withdrawn: XMarkIcon,
    build: BuildingOffice2Icon,
    version: CubeIcon,
    gitHub: GitHub,
    import: ArrowDownOnSquareStackIcon,
    export: ArrowUpOnSquareStackIcon,
    clear: TrashIcon,
    sun: SunIcon,
    moon: MoonIcon,
    user: UserIcon,
    image: PhotoIcon,
    delete: XCircleIcon,

} as const;

export default Icons;

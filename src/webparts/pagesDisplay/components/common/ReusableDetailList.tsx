import * as React from "react";
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  DetailsHeader,
  Selection,
  IDetailsListStyles,
} from "@fluentui/react/lib/DetailsList";
import { mergeStyles } from "@fluentui/react";
import "./styles.css";
import { IColumnInfo } from "../PagesList/PagesService";
import { WebPartContext } from "@microsoft/sp-webpart-base";

const gridStyles: Partial<IDetailsListStyles> = {
  root: {},
  headerWrapper: {},
};

const customHeaderClass = mergeStyles({
  backgroundColor: "#efefef",
  color: "white",
  paddingTop: 0,
  paddingBottom: 0,
  selectors: {
    "& .ms-DetailsHeader": {
      backgroundColor: "#0078d4",
      borderBottom: "1px solid #ccc",
    },
  },
});

export interface IReusableDetailListcomponentsProps {
  columns: (
    columns: IColumnInfo[],
    context: WebPartContext,
    currentUser: any,
    onColumnClick: any,
    sortBy: string,
    isDecending: boolean,
    setShowFilter: (column: IColumn, columnType: string) => void
  ) => IColumn[];
  columnInfos: IColumnInfo[];
  currentUser: any;
  context: WebPartContext;
  setShowFilter: (column: IColumn, columnType: string) => void;
  updateSelection: (selection: Selection) => void;
  items: any[];
  sortPages: (column: IColumn, isAscending: boolean) => void;
  sortBy: string;
  siteUrl: string;
  isDecending: boolean;
  loadMoreItems: () => void; // New prop to load more items
  initialScrollTop: number;
  updateScrollPosition: (scrollTop: number) => void;
}

export interface IReusableDetailListcomponentsState {}
export class ReusableDetailList extends React.Component<
  IReusableDetailListcomponentsProps,
  IReusableDetailListcomponentsState
> {
  private _selection: Selection;
  private containerRef: React.RefObject<HTMLDivElement>;

  constructor(props: IReusableDetailListcomponentsProps) {
    super(props);
    this._selection = new Selection({
      onSelectionChanged: () => {
        this.props.updateSelection(this._selection);
      },
      getKey: this._getKey,
    });

    this.state = {
      isLoading: false,
    };

    this.containerRef = React.createRef(); // Ref for the scrollable container
  }

  componentDidUpdate() {
    const { initialScrollTop } = this.props;
    const element = document.querySelector(".ms-DetailsList-contentWrapper"); // Target element by class name

    element && element.setAttribute("data-is-scrollable", "true");

    element &&
      element.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });
    if (element) {
      // Restore scroll position on mount
      element.scrollTop = initialScrollTop;
      element.addEventListener("scroll", this.handleScroll);
    }
  }

  componentWillUnmount() {
    // Save scroll position before unmounting
    const element = document.querySelector(".scrollable-container"); // Target element by class name

    if (element) {
      element.removeEventListener("scroll", this.handleScroll);
    }
  }

  handleScroll = () => {
    const container = document.querySelector(".ms-DetailsList-contentWrapper"); // Target the element by class name
    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Load more items when scrolled to the bottom
      if (scrollTop + clientHeight + 5 >= scrollHeight) {
        this.props.updateScrollPosition(scrollTop);
        this.props.loadMoreItems(); // Trigger loading more items from the parent
      }
    }
  };
  public render() {
    const {
      columnInfos,
      currentUser,
      context,
      columns,
      items,
      sortPages,
      sortBy,
      isDecending,
      setShowFilter,
    } = this.props; // Custom selection logic

    return (
      <div ref={this.containerRef}>
        <DetailsList
          styles={gridStyles}
          items={items}
          compact={true}
          columns={columns(
            columnInfos,
            context,
            currentUser,
            sortPages,
            sortBy,
            isDecending,
            setShowFilter
          )}
          selectionMode={SelectionMode.single}
          selection={this._selection}
          getKey={this._getKey}
          setKey="none"
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible={true}
          onRenderDetailsHeader={this._onRenderDetailsHeader}
          onItemInvoked={(item) => {
            const scrollTop =
              window.pageYOffset || document.documentElement.scrollTop;

            // Your selection logic here
            this._onItemInvoked(item);

            // Restore scroll position
            window.scrollTo(0, scrollTop);
          }}
          onShouldVirtualize={() => items.length > 100}
        />
      </div>
    );
  }

  private _getKey(item: any, index?: number): string {
    return item.key || index?.toString() || "";
  }

  private _onItemInvoked = (item: any): void => {
    window.open(`${this.props.siteUrl}${item.FileRef}`, "_blank");
  };

  private _onRenderDetailsHeader = (props: any) => {
    if (!props) {
      return null;
    }

    return (
      <DetailsHeader
        {...props}
        className="detailListHeader"
        styles={{ root: customHeaderClass }}
      />
    );
  };
}

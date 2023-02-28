import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Modal,
  ResourceList,
  Avatar,
  ResourceItem,
  Card,
  Icon,
  TextContainer,
  Form,
  FormLayout,
  TextField,
} from "@shopify/polaris";
import { SearchMajor, ArrowUpMinor } from "@shopify/polaris-icons";
const SearchResults = ({
  productWithVariants,
  displaySettings,
  allProducts,
  setDisplay,
}) => {
  const [productsFullInfo, setProductsFullInfo] = useState([]);
  useEffect(() => {
    if (allProducts.length > 0) {
      setSearchResult([]);
      setSearchTerm("");
    }
  }, [allProducts]);

  const [active, setActive] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const [positionMoveTo, setPositionMoveTo] = useState(0);
  const [enableMoveToPositionForm, setEnableMoveToPositionForm] =
    useState(false);

  const [positionMoveToPage, setPositionMoveToPage] = useState(0);
  const [enableMoveToPageForm, setEnableMoveToPageForm] = useState(false);

  const handleChangeSearchTerm = useCallback(
    (newValue) => setSearchTerm(newValue),
    []
  );

  const handleChange = useCallback(() => setActive(!active), [active]);

  const activator = (
    <Button icon={SearchMajor} onClick={handleChange}>
      Custom Search
    </Button>
  );
  const moveToPositionSubmit = (event) => {
    setDisplay({
      ...displaySettings,
      selectedItems: selectedItems,
      moveToPosition: { number: positionMoveTo },
    });
    setTimeout(() => {
      setPositionMoveTo(0);
      setEnableMoveToPositionForm(false);
      setSelectedItems([]);
      setDisplay({
        ...displaySettings,
        selectedItems: [],
        moveToPosition: null,
      });
      setActive(false);
    }, 500);
  };
  const moveToPageSubmit = (event) => {
    setDisplay({
      ...displaySettings,
      selectedItems: selectedItems,
      moveToPage: { number: positionMoveToPage },
    });
    setTimeout(() => {
      setPositionMoveTo(0);
      setEnableMoveToPositionForm(false);
      setSelectedItems([]);
      setDisplay({
        ...displaySettings,
        selectedItems: [],
        moveToPage: null,
      });
      setActive(false);
    }, 500);
  };

  const movetoTop = () => {
    setDisplay({
      ...displaySettings,
      selectedItems: selectedItems,
      moveToTop: true,
    });
    setTimeout(() => {
      setDisplay({
        ...displaySettings,
        selectedItems: [],
        moveToTop: false,
      });
      setActive(false);
    }, 500);
  };
  const moveToBottom = () => {
    setDisplay({
      ...displaySettings,
      selectedItems: selectedItems,
      moveToBottom: true,
    });
    setTimeout(() => {
      setDisplay({
        ...displaySettings,
        selectedItems: [],
        moveToBottom: false,
      });
      setActive(false);
    }, 500);
  };
  const promotedBulkActions = [
    {
      content: (
        <>
          <TextContainer>Move to top </TextContainer>
        </>
      ),
      onAction: movetoTop,
    },
  ];

  const bulkActions = [
    {
      content: "Move to Top",
      onAction: movetoTop,
    },
    {
      content: "Move to Bottom",
      onAction: moveToBottom,
    },
    {
      content: "Move To Position",
      onAction: () => {
        setEnableMoveToPositionForm(true);
      },
    },
    {
      content: "Move To Page",
      onAction: () => {
        setEnableMoveToPageForm(true);
      },
    },
  ];

  const doSearch = (term, products) => {
    term = term.toLowerCase();

    let result = products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.tags.toLowerCase().includes(term) ||
          p.variants
            .map((v) => v.sku.toLowerCase())
            .join(",")
            .includes(term)
      )
      .slice(0, 9);
    setSearchResult(result);
    return result;
  };

  return (
    <>
      <Modal
        activator={activator}
        open={active}
        onClose={handleChange}
        title="Custom search by tags, title or sku code"
      >
        <Modal.Section>
          <TextField
            label="Search Term"
            value={searchTerm}
            onChange={handleChangeSearchTerm}
            autoComplete="off"
          />
          <Button
            onClick={() => {
              doSearch(searchTerm, allProducts);
            }}
            icon={SearchMajor}
          ></Button>
        </Modal.Section>
        <Modal.Section>
          {selectedItems && enableMoveToPositionForm && (
            <Form onSubmit={moveToPositionSubmit} implicitSubmit={true}>
              Move to Specific Position
              <FormLayout>
                <TextField
                  value={positionMoveTo}
                  onChange={setPositionMoveTo}
                  type="number"
                />
                <Button submit>Move</Button>
              </FormLayout>
            </Form>
          )}
          {selectedItems && enableMoveToPageForm && (
            <Form onSubmit={moveToPageSubmit} implicitSubmit={true}>
              Move to Specific Page
              <FormLayout>
                <TextField
                  value={positionMoveToPage}
                  onChange={setPositionMoveToPage}
                  type="number"
                />
                <Button submit>Move</Button>
              </FormLayout>
            </Form>
          )}

          {searchResult.length > 0 && (
            <>
              <ResourceList
                selectable={true}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                isFiltered={true}
                resourceName={{ singular: "product", plural: "products" }}
                items={searchResult}
                bulkActions={bulkActions}
                promotedBulkActions={promotedBulkActions}
                renderItem={(item) => {
                  const { id, title, vendor, images } = item;
                  const media = (
                    <Avatar
                      source={images[0].src}
                      customer
                      size="medium"
                      name={title}
                    />
                  );

                  return (
                    <ResourceItem
                      id={id}
                      url={""}
                      media={media}
                      accessibilityLabel={`View details for ${title}`}
                    >
                      <p variant="bodyMd" fontWeight="bold" as="h3">
                        {title}
                      </p>
                      <div>{vendor} </div>
                    </ResourceItem>
                  );
                }}
              />
            </>
          )}
        </Modal.Section>
      </Modal>
    </>
  );
};

export default SearchResults;

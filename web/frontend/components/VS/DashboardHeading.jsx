import {
  Layout,
  Card,
  Grid,
  Select,
  RangeSlider,
  Button,
  Icon,
  Modal,
  TextContainer,
  Checkbox,
  Tabs,
  ButtonGroup,
} from "@shopify/polaris";

import { AccessibilityMajor } from "@shopify/polaris-icons";
import { useAppQuery, useAuthenticatedFetch } from "../../hooks";

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import SearchResults from "./searchResults";
import { SortByTool } from "./SortByTool";


export const DashboardHeading = ({
  api,
  collections,
  setCollections,
  selectedCollection,
  setSelectedCollection,
  setLimit,
  limit,
  setColumns,
  columns,
  setPerPage,
  productPerPage,
  displaySettings,
  setDisplay,
  products,
}) => {
  const fetch = useAuthenticatedFetch();
  const [locations, setLocations] = useState(null);
  //global state
  const productsState = useSelector((state) => state.products);

  useEffect(async () => {
    const { locations } = await api({
      method: "GET",
      endpoint: "/admin/api/2022-10/locations.json",
    });
    if (locations) handleLocations(locations);
    const data = await api({
      method: "GET",
      endpoint: "/admin/api/2022-10/custom_collections.json",
    });

    const dataSmart = await api({
      method: "GET",
      endpoint: "/admin/api/2022-10/smart_collections.json",
    });

    let selectCollections = [{ label: "Select a collection", value: "" }];

    data.custom_collections.forEach((c) => {
      selectCollections = [
        ...selectCollections,
        { label: c.title, value: `${c.id}` },
      ];
    });

    dataSmart.smart_collections.forEach((c) => {
      selectCollections = [
        ...selectCollections,
        { label: c.title, value: `${c.id}` },
      ];
    });

    console.log("smart-collections: ", selectCollections);
    setCollections(selectCollections);
  }, []);
  useEffect(async () => {
    if (locations) {
      setDisplay({
        ...displaySettings,
        locations: locations.map((location) => {
          return { ...location, selected: false };
        }),
      });
    }
  }, [locations]);

  const [active, setActive] = useState(false);

  const DisplaySettingsLocations = ({ displaySettings, setDisplay }) => {
    const [locations, setLocations] = useState(displaySettings.locations);

    const handleChange = (index) => {
      setDisplay({
        ...displaySettings,
        enableLocations: true,
        locations: locations.map((location, i) => {
          if (i === index) {
            return { ...location, selected: !location.selected };
          }
          return location;
        }),
      });
    };

    return (
      <div>
        {locations.map((location, index) => (
          <div key={location.id}>
            <Checkbox
              checked={location.selected}
              onChange={() => handleChange(index)}
              label={location.name}
            />
          </div>
        ))}
      </div>
    );
  };

  const handleChange = useCallback(() => setActive(!active), [active]);
  const activator = (
    <Button icon={AccessibilityMajor} onClick={handleChange}>
      Display Settings
    </Button>
  );

  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    []
  );
  const handleLocations = useCallback(
    (locationsArray) => setLocations(locationsArray),
    []
  );

  const tabs = [
    {
      id: "tab-1",
      content: "All",
      accessibilityLabel: "#",
      panelID: "all-customers-content-1",
    },
    {
      id: "tab-2",
      content: "Visibility Features",
      panelID: "accepts-marketing-content-2",
    },
    {
      id: "tab-3",
      content: "Inventory",
      panelID: "3",
    },
  ];

  return (
    <Layout sectioned={true}>
      <Card sectioned={true}>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
            <Select
              label="Collection"
              options={collections}
              onChange={setSelectedCollection}
              value={`${selectedCollection}`}
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 2, sm: 1, md: 1, lg: 3, xl: 3 }}>
            <Button
              onClick={async (_) => {
                // const responseOrder = await api({
                //   method: "PUT",
                //   endpoint: `/admin/api/2023-01/custom_collections/`,
                //   test: true,
                //   id: selectedCollection,
                //   data: {
                //     custom_collection:{
                //      /*  id: selectedCollection, */
                //       collects: [
                //         {
                //           id: 33197023133848,
                //           position: 1
                //         }/* ,
                //         {
                //           product_id: 7392838746264,
                //           position: 2
                //         } */
                //       ]
                //     }
                //   }
                // });
                const requestOptions = {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                };
                try {
                  console.log("click");
                  const response = await fetch(
                    "/api/shopify/products/reorder",
                    requestOptions
                  );
                } catch (error) {
                  console.log(error);
                }

                /* const ress = await api({
              method: "POST",
              endpoint: "/api/shopify/products/reorder",
              data: {toChangue: []}
            }) */
              }}
            >
              sdfsd
            </Button>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 2, sm: 1, md: 1, lg: 2, xl: 2 }}>
            {productsState.collectInfo.totalProducts <= 2000 &&
              productsState.collectInfo.totalProducts > 0 &&
              productsState.loadedAllProducts && (
                <>
                  <SortByTool productsQuantity={products.length} />
                </>
              )}
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 2, sm: 1, md: 1, lg: 2, xl: 2 }}>
            {products.length > 0 && (
              <>
                <SearchResults
                  allProducts={products}
                  displaySettings={displaySettings}
                  productWithVariants={products}
                  setDisplay={setDisplay}
                />
              </>
            )}
          </Grid.Cell>
          {selectedCollection != "" && (
            <Grid.Cell columnSpan={{ xs: 2, sm: 1, md: 1, lg: 2, xl: 2 }}>
              <Modal
                activator={activator}
                open={active}
                onClose={handleChange}
                title="Visualization Options"
              >
                <Modal.Section>
                  <Tabs
                    tabs={tabs}
                    selected={selected}
                    onSelect={handleTabChange}
                  >
                    <Card.Section title={tabs[selected].content}>
                      {tabs[selected].id == "tab-1" && (
                        <>
                          <Select
                            label="Products per page"
                            options={[
                              { label: "8", value: "8" },
                              { label: "16", value: "16" },
                              { label: "20", value: "20" },
                              { label: "50", value: "50" },
                              { label: "100", value: "100" },
                              { label: "250", value: "250" },
                            ]}
                            onChange={setPerPage}
                            value={productPerPage}
                          />
                          <Select
                            label="Numbre of columns"
                            options={[
                              { label: "2", value: "6" },
                              { label: "4", value: "3" },
                              { label: "6", value: "2" },
                            ]}
                            onChange={setColumns}
                            value={columns}
                          />
                        </>
                      )}
                      {tabs[selected].id == "tab-3" && (
                        <>
                          <Checkbox
                            label="Show Product Inventory"
                            checked={displaySettings.inventory}
                            onChange={() =>
                              setDisplay({
                                ...displaySettings,
                                inventory: !displaySettings["inventory"],
                              })
                            }
                          />
                          <Layout title="Per Location">Location</Layout>
                          {displaySettings.locations.length > 0 && (
                            <>
                              <DisplaySettingsLocations
                                setDisplay={setDisplay}
                                displaySettings={displaySettings}
                              />
                            </>
                          )}
                        </>
                      )}
                      {tabs[selected].id == "tab-2" && (
                        <>
                          <Checkbox
                            label="Show Product Title"
                            checked={displaySettings.title}
                            onChange={() =>
                              setDisplay({
                                ...displaySettings,
                                title: !displaySettings["title"],
                              })
                            }
                          />
                          <br />
                          <Checkbox
                            label="Show Product Price"
                            checked={displaySettings.price}
                            onChange={() =>
                              setDisplay({
                                ...displaySettings,
                                price: !displaySettings["price"],
                              })
                            }
                          />
                          <br />
                          <Checkbox
                            label="Show Product Vendor"
                            checked={displaySettings.vendor}
                            onChange={() =>
                              setDisplay({
                                ...displaySettings,
                                vendor: !displaySettings["vendor"],
                              })
                            }
                          />
                          <br />

                          <br />
                          <Checkbox
                            label="Show Unpublished Products"
                            checked={displaySettings.published}
                            onChange={() =>
                              setDisplay({
                                ...displaySettings,
                                published: !displaySettings["published"],
                              })
                            }
                          />
                          <br />
                          <Checkbox
                            label="Show Product Type"
                            checked={displaySettings.type}
                            onChange={() =>
                              setDisplay({
                                ...displaySettings,
                                type: !displaySettings["type"],
                              })
                            }
                          />
                          <br />
                          <Checkbox
                            label="Show Variants Prices"
                            checked={displaySettings.priceFull}
                            onChange={() =>
                              setDisplay({
                                ...displaySettings,
                                priceFull: !displaySettings["priceFull"],
                              })
                            }
                          />
                        </>
                      )}
                    </Card.Section>
                  </Tabs>
                </Modal.Section>
              </Modal>
            </Grid.Cell>
          )}
        </Grid>
      </Card>
    </Layout>
  );
};

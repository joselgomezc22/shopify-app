import {Button, Modal, Stack, DropZone, Checkbox, Select} from '@shopify/polaris';
import {useState, useCallback} from 'react';
import { SortAscendingMajor } from '@shopify/polaris-icons';
import { useDispatch } from 'react-redux';
import { setFilter, setOrder } from '../../redux/slices/filterSlice';
export const SortByTool = () => {
    const [active, setActive] = useState(false);
  const [checked, setChecked] = useState(false);
  const [filterSelected, setFilterSelected] = useState("")
  const [priceOrder, setPriceOrder] = useState("asc")

  //global state
  const dispatch = useDispatch()

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleCheckbox = useCallback((value) => setChecked(value), []);

  const activator = <Button icon={SortAscendingMajor} onClick={toggleActive}>Bulk Actions</Button>;
  return (
    <div style={{height: '500px'}}>
    <Modal
      small
      activator={activator}
      open={active}
      onClose={toggleActive}
      title="Bulk Actions"
      primaryAction={
        [{
          content: "Apply",
          onAction: _ => {
            dispatch(setFilter(filterSelected))
            dispatch(setOrder(priceOrder))
            toggleActive()
          }
        }]
      }
      secondaryActions={
        [{
          content: "Cancel",
          onAction: toggleActive
        }]
      }
    >
      <Modal.Section>
        <Stack vertical>
          <Select
            label="Sort by:"
            options={[
              {label: "Select filter", value: ""},
              {label: "Price", value: "price"}
            ]}
            onChange={setFilterSelected}
            value={filterSelected}
          />
          {filterSelected !== "" && 
            <Select 
            options={[
              {label: "High to low", value: "desc"},
              {label: "Low to high", value: "asc"}
            ]}
            onChange={setPriceOrder}
            value={priceOrder}
          />
          }
          
        </Stack>
      </Modal.Section>
    </Modal>
  </div>
  )
}

import React, { useCallback, useState } from 'react'
import { Modal, Select, TextContainer, TextField } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux';
import { setArrayProducts } from '../../redux/slices/productsSlice';
import { chunks } from '../../utils/tools';

const ModalQuickActions = ({ showModal, closeModal, selectedItems = [], clearSelection, productsArray, setProductsArray, perPage, showSaveButton }) => {

  const productsState = useSelector(state => state.products)
  const dispatch = useDispatch()
  const [selectedOpt, setSelectedOpt] = useState("position")
  const [value, setValue] = useState('');

  const handleChange = useCallback((newValue) => setValue(newValue), []);

  const doneHandler = _ => {
    const newValue = value - 1
    const filterProducts = productsArray.filter(item => !selectedItems.some(itemSelected => itemSelected.getAttribute('data-id') == item.id))
    const reorderProducts = productsArray.filter(item => selectedItems.some(itemSelected => itemSelected.getAttribute('data-id') == item.id))
    if (selectedOpt === "position") {
      if (reorderProducts.length + (+value) <= productsState.collectInfo.totalProducts) {
        let start = filterProducts.slice().splice(0, newValue)
        const end = filterProducts.slice().splice(newValue)
        start = [...start, ...reorderProducts]
        const defArray = [...start, ...end].map(({ chosen, ...rest }) => {
          return rest;
        });
        // dispatch(setArrayProducts(defArray))
        setProductsArray(defArray)
      } else {
        console.log("position not valid")
      }

    } else {
      const totalPages = Math.ceil(productsArray.length / perPage)
      if ((+value) <= totalPages) {
        // console.log("page", perPage)
        let pages = [...chunks(filterProducts, perPage)]
        pages[newValue] = [...reorderProducts, ...pages[newValue]]
        dispatch(setArrayProducts(pages.flat()))
        const newProducts = pages.flat().map(({ chosen, ...rest }) => {
          return rest;
        });
        setProductsArray(newProducts)
      }else{
        console.log("page not valid")
      }
    }
    showSaveButton(true)
    closeModal();
  }
  return (
    <Modal
      open={showModal}
      title="Quick Actions"
      onClose={(_) => {
        closeModal();
        // clearSelection();
      }}
      primaryAction={{
        content: "Done",
        onAction: doneHandler,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: () => {
            closeModal();
            // clearSelection();
          },
        },
      ]}
    >
      <Modal.Section>

      </Modal.Section>
      <Modal.Section>
        <Select
          label="Move selection to..."
          options={[
            {
              label: "position",
              value: "position"
            },
            {
              label: "page",
              value: "page"
            }
          ]}
          onChange={setSelectedOpt}
          value={selectedOpt}
        />
        <TextField
          type='number'
          label={selectedOpt}
          placeholder={selectedOpt}
          onChange={handleChange}
          value={value}
          autoComplete="off" />
      </Modal.Section>
    </Modal>
  );
}

export default ModalQuickActions;
import React, { useCallback, useState } from 'react'
import { Modal, Select, TextContainer, TextField } from '@shopify/polaris';
import { useDispatch } from 'react-redux';
import { setArrayProducts } from '../../redux/slices/productsSlice';
import { chunks } from '../../utils/tools';

const ModalQuickActions = ({ showModal, closeModal, selectedItems = [], clearSelection, productsArray, setProductsArray, perPage }) => {

  const dispatch = useDispatch()
  const [selectedOpt, setSelectedOpt] = useState("position")
  const [value, setValue] = useState('');

  const handleChange = useCallback((newValue) => setValue(newValue), []);

  const doneHandler = _ => {
    const newValue = value - 1
    const filterProducts = productsArray.filter(item => !selectedItems.some(itemSelected => itemSelected.getAttribute('data-id') == item.id))
    const reorderProducts = productsArray.filter(item => selectedItems.some(itemSelected => itemSelected.getAttribute('data-id') == item.id))
    if (selectedOpt === "position") {
      let start = filterProducts.slice().splice(0, newValue)
      const end = filterProducts.slice().splice(newValue)
      start = [...start, ...reorderProducts]
      const defArray = [...start, ...end]
      /* console.log(defArray) */
      dispatch(setArrayProducts(defArray))
      setProductsArray(defArray)
    } else {
      const totalPages = Math.ceil(productsArray.length / perPage)
      console.log("page", perPage)
      let pages = [...chunks(filterProducts, perPage)]
      pages[newValue] = [...reorderProducts, ...pages[newValue]]
      /* console.log("paginated order",pages.flat()) */
      dispatch(setArrayProducts(pages.flat()))
      setProductsArray(pages.flat())
    }
    closeModal();
    clearSelection();
  }
  return (
    <Modal
      open={showModal}
      title="Quick Actions"
      onClose={(_) => {
        closeModal();
        clearSelection();
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
            clearSelection();
          },
        },
      ]}
    >
      <Modal.Section>
        <TextContainer>
          <p>
            <ul>
              {selectedItems.map((item, index) => {
                return <li>{item.getAttribute('data-id')}</li>
              })}
            </ul>
          </p>
        </TextContainer>
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
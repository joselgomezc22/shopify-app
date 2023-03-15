import React from 'react'
import { Modal, TextContainer } from '@shopify/polaris';

const ModalQuickActions = ({showModal, closeModal, selectedItems=[], clearSelection}) => {
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
          onAction: () => {
            closeModal();
            clearSelection();
          },
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
              {selectedItems.map((item, index)=>{
                return <li>{item.getAttribute('data-id')}</li>
              })}
              </ul>
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    );
}

export default ModalQuickActions;
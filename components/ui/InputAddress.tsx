import { IonButton } from '@ionic/react';
import { useState } from 'react';

const InputAddress = (props) => {
  const { onClick, address, setAddress } = props;

  const handleChange = async (event: any) => {
    switch (event.target.name) {
      case 'address':
        setAddress(event.target.value);
        break;
      default:
        console.log('key not found');
    }
  };

  return (
    <>
      <p className="title">Gamebook system using block chains.</p>
      <input
        className="input-numbering-address"
        type="text"
        placeholder="Input to Number"
        name="address"
        value={address}
        onChange={handleChange}
      ></input>
      <div className="submit-wrapper pb-4">
        <IonButton
          mode="ios"
          color="light"
          size="small"
          onClick={() => {
            onClick(address);
          }}
        >
          Fetch
        </IonButton>
      </div>
    </>
  );
};

export default InputAddress;

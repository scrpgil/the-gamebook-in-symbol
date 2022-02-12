import { IonButton } from '@ionic/react';
import { useState } from 'react';

const RegisterAddress = (props) => {
  const { onClick } = props;
  const [registAddress, setRegistAddress] = useState('');
  const [registAddressText, setRegistAddressText] = useState('');
  const [privKey, setPrivKey] = useState('');

  const handleChange = async (event: any) => {
    switch (event.target.name) {
      case 'input_private_key':
        setPrivKey(event.target.value);
        break;
      case 'regist_address':
        setRegistAddressText(event.target.value);
        break;
      case 'regist_sym_address':
        setRegistAddress(event.target.value);
        break;
      default:
        console.log('key not found');
    }
  };
  return (
    <div>
      <p className="py-2">
        あなたは任意の文字列とSymbolアドレスを組み合わせることで、
        <br />
        このGamebookに番地を登録することができます。
      </p>
      <p className="py-2">
        ひょっとしたら、すでに番地を取得されている可能性もありますが、
        <br />
        その場合は、先に登録したものを優先します。
      </p>
      <div className="pt-3">
        <label className="text-sm" htmlFor="regist_address">
          番地名
        </label>
        <input
          className="input-numbering-address"
          type="text"
          name="regist_address"
          value={registAddressText}
          onChange={handleChange}
        ></input>
      </div>
      <div className="pt-3">
        <label className="text-sm" htmlFor="regist_sym_address">
          Symbolのアドレス
        </label>
        <input
          className="input-numbering-address"
          type="text"
          name="regist_sym_address"
          value={registAddress}
          onChange={handleChange}
        ></input>
      </div>
      <div className="pt-3">
        <label className="text-sm" htmlFor="input_private_key">
          Private Key
        </label>
        <input
          className="input-numbering-address"
          type="password"
          name="input_private_key"
          value={privKey}
          onChange={handleChange}
        ></input>
      </div>
      <div className="submit-wrapper pt-3">
        <IonButton
          mode="ios"
          color="light"
          size="small"
          className="h-8"
          onClick={() => {
            onClick(registAddressText, registAddress, privKey);
          }}
        >
          Regist to Address
        </IonButton>
      </div>
    </div>
  );
};

export default RegisterAddress;

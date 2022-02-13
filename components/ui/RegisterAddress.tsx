import { IonButton } from '@ionic/react';
import { useState } from 'react';
import { createNewAccount } from 'services/symbol';

const RegisterAddress = (props) => {
  const { onClick, fee } = props;
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
  const onGenerateAccount = async () => {
    let account = await createNewAccount();
    setRegistAddress(account.address.plain());
  };
  return (
    <div>
      <p className="py-2">
        あなたは任意の文字列とSymbolアドレスを組み合わせることで、
        <br />
        このGamebookに番地を登録することができます。
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
          Symbolのアドレス{' '}
          <button className="border-b-2 mb-1 ml-2" onClick={onGenerateAccount}>
            自動生成
          </button>
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
          Private Key（ウォレットのKey） *取り扱いには注意してください！
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
          disabled={!(registAddressText && registAddress && privKey)}
          onClick={() => {
            onClick(registAddressText, registAddress, privKey);
          }}
        >
          Regist to Address（Fee: Max 2.0xym）
        </IonButton>
      </div>
    </div>
  );
};

export default RegisterAddress;

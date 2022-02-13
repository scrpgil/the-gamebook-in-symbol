import { IonButton } from '@ionic/react';
import { useState } from 'react';
import { NUMBERING_ADDRESS } from 'services/const';
import { createTransferTransaction } from 'services/symbol';

const RegisterMessage = (props) => {
  const { onClick } = props;
  const [registAddressText, setRegistAddressText] = useState('');
  const [registMessage, setRegistMessage] = useState('');
  const [privKey, setPrivKey] = useState('');

  const calcTransactionFee = async (message: string) => {
    let tt = await createTransferTransaction(NUMBERING_ADDRESS, message, privKey);
  };
  const handleChange = async (event: any) => {
    switch (event.target.name) {
      case 'input_private_key':
        setPrivKey(event.target.value);
        break;
      case 'regist_address':
        setRegistAddressText(event.target.value);
        break;
      case 'regist_message':
        setRegistMessage(event.target.value);
        break;
      default:
        console.log('key not found');
    }
  };

  return (
    <div className="message-wrapper">
      <p className="py-2">
        あなたは任意の番地にメッセージを記録することができます。
        <br />
        もし番地がまた登録されていない場合は、書き込みできません。
      </p>
      <p className="py-2">先に番地登録をするなら【regist_address】へ</p>
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
          メッセージ
        </label>
        <textarea
          className="input-numbering-address"
          name="regist_message"
          value={registMessage}
          onChange={handleChange}
        ></textarea>
      </div>
      <div className="pt-3">
        <label className="text-sm" htmlFor="input_private_key">
          Private Key（ウォレットのKey）*取り扱いには注意してください！
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
            onClick(registAddressText, registMessage, privKey);
          }}
        >
          Regist to Message
        </IonButton>
      </div>
    </div>
  );
};

export default RegisterMessage;

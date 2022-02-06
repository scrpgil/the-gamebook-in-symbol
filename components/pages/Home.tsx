import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { helpCircleOutline } from 'ionicons/icons';

import { useState } from 'react';
import {
  createRegistAddressMessage,
  decodeNumberingAddress,
  NumberingAddress,
  replaceNumberingAnchor,
} from '../../services/gamebook';
import {
  createTransferTransaction,
  getAllRawMessages,
  getAllTransaction,
  NUMBERING_ADDRESS,
  transactionAnnounce,
} from '../../services/symbol';
import { getQueryVariable, replaceImage, sanitize } from '../../services/util';

const Home: React.FC = () => {
  const [address, setAddress] = useState('1');
  const [readAddress, setReadAddress] = useState<NumberingAddress>();
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [numberingMessages, setNumberingAddress] = useState<NumberingAddress[]>([]);
  const [registAddress, setRegistAddress] = useState('');
  const [registAddressText, setRegistAddressText] = useState('');
  const [registMessage, setRegistMessage] = useState('');
  const [privKey, setPrivKey] = useState('');
  const [fee, setFee] = useState(0);

  const getSearchAddressMessages = async (
    text: string,
    numberingAddressArray: NumberingAddress[],
  ): Promise<NumberingAddress | null> => {
    return new Promise(async (resolve, reject) => {
      for (const numberingAddress of numberingAddressArray) {
        if (numberingAddress.text === text) {
          resolve(numberingAddress);
        }
      }
      resolve(null);
    });
  };

  const getNumberingAddress = async (numberingAddress: NumberingAddress) => {
    await getAddressMessages(numberingAddress.address);
    setReadAddress(numberingAddress);
  };

  const getAddressMessages = async (address: string) => {
    const transactions = await getAllTransaction(address);
    setMessage(transactions[0].message.payload);
  };

  useIonViewWillEnter(async () => {
    setLoading(true);
    const transactions = await getAllTransaction();
    const rawMessages = await getAllRawMessages(transactions);
    const nm: NumberingAddress[] = await decodeNumberingAddress(rawMessages);
    setNumberingAddress(nm);
    let addr = getQueryVariable(document.URL, 'address')
      ? getQueryVariable(document.URL, 'address')
      : '1';
    setAddress(addr);
    setReadAddress({ text: addr, address: '' });
    let nmm = await getSearchAddressMessages(addr, nm);
    if (nmm) {
      getNumberingAddress(nmm);
    }
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  });

  const registToAddress = async () => {
    let msg = await createRegistAddressMessage(registAddressText, registAddress);
    let tt = await createTransferTransaction(NUMBERING_ADDRESS, msg, privKey);
    transactionAnnounce(tt);
  };

  const registToMessage = async () => {
    let nmm = await getSearchAddressMessages(registAddressText, numberingMessages);
    if (nmm) {
      let tt = await createTransferTransaction(nmm.address, registMessage, privKey);
      transactionAnnounce(tt);
    }
  };

  const calcTransactionFee = async (message: string) => {
    let tt = await createTransferTransaction(NUMBERING_ADDRESS, message, privKey);
  };

  const handleChange = async (event: any) => {
    let msg = '';
    switch (event.target.name) {
      case 'address':
        setAddress(event.target.value);
        break;
      case 'input_private_key':
        setPrivKey(event.target.value);
        break;
      case 'regist_address':
        setRegistAddressText(event.target.value);
        break;
      case 'regist_sym_address':
        setRegistAddress(event.target.value);
        break;
      case 'regist_message':
        setRegistMessage(event.target.value);
        break;
      default:
        console.log('key not found');
    }
  };

  return (
    <IonPage>
      <IonHeader mode="ios">
        <IonToolbar mode="ios" color="dark">
          <IonTitle>The world is a gamebook</IonTitle>
          <IonButtons slot="primary">
            <IonButton>
              <IonIcon slot="icon-only" icon={helpCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="fetch-wrapper px-4">
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
              onClick={async () => {
                setMessage('');
                let newurl =
                  window.location.protocol +
                  '//' +
                  window.location.host +
                  window.location.pathname +
                  '?address=' +
                  address;
                window.history.pushState({ path: newurl }, '', newurl);
                setReadAddress({ text: address, address: '' });
                let nmm = await getSearchAddressMessages(address, numberingMessages);
                if (nmm) {
                  getNumberingAddress(nmm);
                }
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                }, 2000);
              }}
            >
              Fetch
            </IonButton>
          </div>
          <hr />
          <div className="fetch-console-wrapper pt-3 px-2">
            {!loading && (
              <>
                <div className="address-wrapper pt-3">
                  <span>【{readAddress?.text}】 </span>
                </div>
                {readAddress?.text === 'regist_message' && (
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
                        Private Key
                      </label>
                      <input
                        className="input-numbering-address"
                        type="text"
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
                          registToMessage();
                        }}
                      >
                        Regist to Message
                      </IonButton>
                    </div>
                  </div>
                )}
                {readAddress?.text === 'regist_address' && (
                  <div className="message-wrapper">
                    <p className="py-2">
                      あなたは任意の文字列とSymbolアドレスを組み合わせることで、
                      <br />
                      このGamebookに番地を登録することができます。
                    </p>
                    <p className="py-2">
                      ひょっとしたら、すでに番地を取れれている可能性もありますが、
                      <br />
                      その場合は、先に登録したものを優先します。
                    </p>
                    <p className="py-2">
                      また、番地登録には、書き込み代をいただきます。
                      <br />
                      これはSymbolのお約束なので、仕方がないのです。
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
                        type="text"
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
                          registToAddress();
                        }}
                      >
                        Regist to Address
                      </IonButton>
                    </div>
                  </div>
                )}
                {readAddress?.text !== 'regist_address' && readAddress?.text !== 'regist_message' && (
                  <>
                    <div
                      className="message-wrapper"
                      dangerouslySetInnerHTML={{
                        __html: replaceImage(replaceNumberingAnchor(sanitize(message))),
                      }}
                    ></div>
                    {!message && (
                      <div className="message-wrapper">
                        <span className="empty-message">
                          <p>
                            <i>〜ここにはまだ何も書かれていない〜</i>
                          </p>
                          <div>
                            番地を登録するなら「
                            <a href="?address=regist_address">regist_address</a>
                            」へ
                          </div>
                          <div>
                            メッセージを登録するなら「
                            <a href="?address=regist_message">regist_message</a>
                            」へ
                          </div>
                        </span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {loading && (
              <>
                <div className="loading-wrapper">get transactions...</div>
              </>
            )}
          </div>
        </div>
      </IonContent>
      <IonFooter>
        <div className="credit">
          <span className="link-wrapper">write</span>
          <span
            className="link-wrapper"
            onClick={() => {
              let url = 'https://testnet.symbol.fyi/accounts/' + readAddress?.address;
              window.open(url, '_blank');
            }}
          >
            explorer
          </span>
          <span className="credit-wrapper">
            creaeted by 2022.{' '}
            <a
              href="https://github.com/scrpgil/TheWorldIsAGamebookInSymbol"
              rel="noreferrer"
              target="_blank"
            >
              github
            </a>
          </span>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default Home;

// <!--<div className="pt-3">Fee: 0 xym</div>-->

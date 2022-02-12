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
import Empty from 'components/ui/Empty';
import Footer from 'components/ui/Footer';
import InputAddress from 'components/ui/InputAddress';
import RegisterAddress from 'components/ui/RegisterAddress';
import RegisterMessage from 'components/ui/RegisterMessage';
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

  /**
   * 番地の登録
   */
  const registToAddress = async (registAddressText, registAddress, privKey) => {
    let msg = await createRegistAddressMessage(registAddressText, registAddress);
    let tt = await createTransferTransaction(NUMBERING_ADDRESS, msg, privKey);
    transactionAnnounce(tt);
  };

  /**
   * メッセージの登録
   */
  const registToMessage = async (registAddressText, registMessage, privKey) => {
    let nmm = await getSearchAddressMessages(registAddressText, numberingMessages);
    if (nmm) {
      let tt = await createTransferTransaction(nmm.address, registMessage, privKey);
      transactionAnnounce(tt);
    }
  };

  /**
   * アドレスの取得処理
   */
  const fetchAddrss = async (fetchAddrss: string) => {
    setAddress(fetchAddrss);
    setMessage('');
    let newurl =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname +
      '?address=' +
      fetchAddrss;
    window.history.pushState({ path: newurl }, '', newurl);
    setReadAddress({ text: fetchAddrss, address: '' });
    let nmm = await getSearchAddressMessages(fetchAddrss, numberingMessages);
    if (nmm) {
      getNumberingAddress(nmm);
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
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
          <InputAddress onClick={fetchAddrss} />
          <hr />
          <div className="fetch-console-wrapper pt-3 px-2 whitespace-pre-wrap">
            {!loading && (
              <>
                <div className="address-wrapper pt-3">
                  <span>【{readAddress?.text}】 </span>
                </div>
                {readAddress?.text === 'regist_message' && (
                  <RegisterMessage onClick={registToMessage} />
                )}
                {readAddress?.text === 'regist_address' && (
                  <RegisterAddress onClick={registToAddress} />
                )}
                {readAddress?.text !== 'regist_address' && readAddress?.text !== 'regist_message' && (
                  <>
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: replaceImage(replaceNumberingAnchor(sanitize(message))),
                      }}
                    ></div>
                    {!message && <Empty />}
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
        <Footer />
      </IonFooter>
    </IonPage>
  );
};

export default Home;

// <!--<div className="pt-3">Fee: 0 xym</div>-->

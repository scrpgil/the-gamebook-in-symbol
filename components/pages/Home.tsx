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
  useIonAlert,
  useIonLoading,
  useIonViewDidEnter,
  useIonViewWillEnter,
} from '@ionic/react';
import Empty from 'components/ui/Empty';
import EmptyAddress from 'components/ui/EmptyAddress';
import Footer from 'components/ui/Footer';
import InputAddress from 'components/ui/InputAddress';
import RegisterAddress from 'components/ui/RegisterAddress';
import RegisterMessage from 'components/ui/RegisterMessage';
import { helpCircleOutline } from 'ionicons/icons';

import { useRef, useState } from 'react';
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
import { getHashVariable, replaceImage, sanitize } from '../../services/util';

const Home: React.FC = () => {
  const [present] = useIonAlert();
  const [loadingPresent, loadingDismiss] = useIonLoading();

  const [address, setAddress] = useState('1');
  const [readAddress, setReadAddress] = useState<NumberingAddress>();
  const [message, setMessage] = useState<string>('');
  const [isEmptyAddress, setIsEmptyAddress] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const numberingMessages = useRef<NumberingAddress[]>([]);
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
    if (transactions && transactions.length > 0 && transactions[0]?.message?.payload) {
      setMessage(transactions[0].message.payload);
    }
  };

  useIonViewWillEnter(async () => {
    setLoading(true);
    const transactions = await getAllTransaction();
    const rawMessages = await getAllRawMessages(transactions);
    const nm: NumberingAddress[] = await decodeNumberingAddress(rawMessages);
    numberingMessages.current = nm;
    let addr = getHashVariable(document.URL) ? getHashVariable(document.URL) : '1';
    setAddress(addr);
    setReadAddress({ text: addr, address: '' });
    let nmm = await getSearchAddressMessages(addr, nm);
    if (nmm) {
      getNumberingAddress(nmm);
      setIsEmptyAddress(false);
    } else {
      setIsEmptyAddress(true);
    }
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  });
  useIonViewDidEnter(async () => {
    window.addEventListener('hashchange', hashChange, false);
  });

  const hashChange = () => {
    let addr = getHashVariable(document.URL) ? getHashVariable(document.URL) : '1';
    fetchAddrss(addr);
  };

  /**
   * 番地の登録
   */
  const registToAddress = async (registAddressText, registAddress, privKey) => {
    try {
      loadingPresent({
        message: '番地登録中...',
        mode: 'ios',
      });
      let msg = await createRegistAddressMessage(registAddressText, registAddress);
      let tt = await createTransferTransaction(NUMBERING_ADDRESS, msg, privKey);
      await transactionAnnounce(tt);
      setTimeout(() => {
        location.href = `${location.protocol}//${location.host}/#${registAddress}`;
        location.reload();
      }, 50000);
    } catch (e) {
      loadingDismiss();
    }
  };

  /**
   * メッセージの登録
   */
  const registToMessage = async (registAddressText, registMessage, privKey) => {
    let nmm = await getSearchAddressMessages(registAddressText, numberingMessages.current);
    if (nmm) {
      try {
        loadingPresent({
          message: 'メッセージ書き込み中...',
          mode: 'ios',
        });
        let tt = await createTransferTransaction(nmm.address, registMessage, privKey);
        await transactionAnnounce(tt);
        setTimeout(() => {
          location.href = `${location.protocol}//${location.host}/#${nmm.text}`;
          location.reload();
        }, 50000);
      } catch (e) {
        loadingDismiss();
      }
    }
  };

  /**
   * アドレスの取得処理
   */
  const fetchAddrss = async (fetchAddrss: string) => {
    setAddress(fetchAddrss);
    setMessage('');
    location.hash = fetchAddrss;
    setReadAddress({ text: fetchAddrss, address: '' });
    let nmm = await getSearchAddressMessages(fetchAddrss, numberingMessages.current);
    if (nmm) {
      getNumberingAddress(nmm);
      setIsEmptyAddress(false);
    } else {
      setIsEmptyAddress(true);
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
            <IonButton
              onClick={() =>
                present({
                  cssClass: 'my-css',
                  header: '遊び方',
                  message:
                    'ゲームブック (Gamebook) は、読者の選択によってストーリーの展開と結末が変わるように作られています。文章は、数百個のパラグラフに分割されており、ルールに沿って読み進めることになります。',
                  buttons: ['Cancel', { text: 'Ok', handler: (d) => console.log('ok pressed') }],
                  onDidDismiss: (e) => console.log('did dismiss'),
                })
              }
            >
              <IonIcon slot="icon-only" icon={helpCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="fetch-wrapper px-4">
          <InputAddress address={address} setAddress={setAddress} onClick={fetchAddrss} />
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
                      className="whitespace-pre-wrap leading-7"
                      dangerouslySetInnerHTML={{
                        __html: replaceImage(replaceNumberingAnchor(sanitize(message))),
                      }}
                    ></div>
                    {!message && isEmptyAddress && <EmptyAddress />}
                    {!message && !isEmptyAddress && <Empty />}
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

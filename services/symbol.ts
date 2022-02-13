import {
  Account,
  Address,
  Deadline,
  NetworkType,
  Page,
  PlainMessage,
  RepositoryFactoryHttp,
  SignedTransaction,
  Transaction,
  TransactionGroup,
  TransferTransaction,
  UInt64,
} from 'symbol-sdk';
import { RawNumberingAddress } from './gamebook';
/** TESTNETのURL */
// export const NODE_URL = "https://sym-test-01.opening-line.jp:3001";
export const NODE_URL = 'https://sym-test-02.opening-line.jp:3001';
/** 番地用アドレス */
export const NUMBERING_ADDRESS = 'TD6Y6MAG4AR2CMWJWQ3DZP3PT5QZ74TDUTNSKPY';

export const getAllTransaction = (
  rawAddress: string = NUMBERING_ADDRESS,
): Promise<TransferTransaction[]> => {
  return new Promise((resolve, reject) => {
    const address = Address.createFromRawAddress(rawAddress);
    const repositoryFactory = new RepositoryFactoryHttp(NODE_URL);
    const transactionHttp = repositoryFactory.createTransactionRepository();

    const searchCriteria = {
      group: TransactionGroup.Confirmed,
      address,
      pageNumber: 1,
      pageSize: 100,
    };
    transactionHttp.search(searchCriteria).subscribe(
      (page: Page<Transaction>) => {
        let transferTransaction: TransferTransaction[] = [];
        page.data.map((entry: Transaction) => {
          let tt = entry as TransferTransaction;
          transferTransaction.push(tt);
        });
        resolve(transferTransaction.reverse());
      },
      (err) => reject(err),
    );
  });
};

export const getAllRawMessages = (
  transferTransactions: TransferTransaction[],
): Promise<RawNumberingAddress[]> => {
  return new Promise((resolve, reject) => {
    let rawNumberingAddress: RawNumberingAddress[] = [];
    for (const tt of transferTransactions) {
      if (tt.message?.payload) {
        try {
          let obj: RawNumberingAddress = JSON.parse(tt.message.payload);
          if (obj && typeof obj == 'object' && Array.isArray(obj) && obj.length === 2) {
            rawNumberingAddress.push(obj);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    resolve(rawNumberingAddress);
  });
};

export const getAllBlocks = () => {
  return new Promise((resolve, reject) => {
    const repositoryFactory = new RepositoryFactoryHttp(NODE_URL);
    const blockHttp = repositoryFactory.createBlockRepository();

    const height = 1;
    blockHttp.getBlockByHeight(UInt64.fromUint(height)).subscribe(
      (block) => resolve(block),
      (err) => reject(err),
    );
  });
};

export const getAddressInfo = () => {
  return new Promise((resolve, reject) => {
    const address = Address.createFromRawAddress(NUMBERING_ADDRESS);
    const repositoryFactory = new RepositoryFactoryHttp(NODE_URL);
    const accountHttp = repositoryFactory.createAccountRepository();
    accountHttp.getAccountInfo(address).subscribe(
      (accountInfo) => resolve(accountInfo),
      (err) => reject(err),
    );
  });
};

// https://docs.symbolplatform.com/ja/concepts/transaction.html
export const createTransferTransaction = async (
  rawAddress: string,
  message: string,
  privateKey: string,
): Promise<SignedTransaction> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(privateKey, rawAddress, message);
      if (!(privateKey && rawAddress && message)) {
        reject(null);
      }

      const recipientAddress = Address.createFromRawAddress(rawAddress);
      const nodeUrl = NODE_URL;
      const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
      const epochAdjustment = await repositoryFactory.getEpochAdjustment().toPromise();
      const networkType = await repositoryFactory.getNetworkType().toPromise();
      const { currency } = await repositoryFactory.getCurrencies().toPromise();

      const transferTransaction = TransferTransaction.create(
        Deadline.create(epochAdjustment),
        recipientAddress,
        [currency.createRelative(0)],
        PlainMessage.create(message),
        networkType,
        UInt64.fromUint(1000000),
      );
      const account = Account.createFromPrivateKey(privateKey, networkType);
      const networkGenerationHash = await repositoryFactory.getGenerationHash().toPromise();
      let signedTransaction: SignedTransaction = account.sign(
        transferTransaction,
        networkGenerationHash,
      );
      resolve(signedTransaction);
    } catch (e) {
      console.log(e);
      reject(null);
    }
  });
};

export const transactionAnnounce = async (signedTransaction: SignedTransaction) => {
  const repositoryFactory = new RepositoryFactoryHttp(NODE_URL);
  const transactionRepository = repositoryFactory.createTransactionRepository();
  const response = await transactionRepository.announce(signedTransaction).toPromise();
  return response;
};

export const createNewAccount = async (): Promise<Account> => {
  const repositoryFactory = new RepositoryFactoryHttp(NODE_URL);
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  const account = Account.generateNewAccount(networkType);
  return account;
};

import {
  Account,
  Address,
  Deadline,
  Page,
  PlainMessage,
  RepositoryFactoryHttp,
  SignedTransaction,
  Transaction,
  TransactionGroup,
  TransferTransaction,
  UInt64,
} from 'symbol-sdk';
import { NODE_URL, NUMBERING_ADDRESS } from './const';
import { RawNumberingAddress } from './gamebook';

export const getAllTransaction = (
  rawAddress: string = NUMBERING_ADDRESS,
): Promise<TransferTransaction[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      let transactions = [];
      let loop = true;
      let pageNumber = 1;
      while (loop) {
        const res = await getTransaction(rawAddress, pageNumber);
        if (res && res.length > 0) {
          transactions = transactions.concat(res);
        } else {
          loop = false;
        }
        pageNumber++;
      }
      resolve(transactions);
    } catch (e) {
      resolve([]);
    }
  });
};

export const getTransaction = (
  rawAddress: string = NUMBERING_ADDRESS,
  pageNumber: number = 1,
): Promise<TransferTransaction[]> => {
  return new Promise((resolve, reject) => {
    const address = Address.createFromRawAddress(rawAddress);
    const repositoryFactory = new RepositoryFactoryHttp(NODE_URL);
    const transactionHttp = repositoryFactory.createTransactionRepository();

    const searchCriteria = {
      group: TransactionGroup.Confirmed,
      address,
      pageNumber: pageNumber,
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
  maxFee: number,
): Promise<SignedTransaction> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!(privateKey && rawAddress && message)) {
        reject(null);
      }

      const recipientAddress = Address.createFromRawAddress(rawAddress);
      const nodeUrl = NODE_URL;
      const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
      const epochAdjustment = await repositoryFactory.getEpochAdjustment().toPromise();
      const networkType = await repositoryFactory.getNetworkType().toPromise();
      const { currency } = await repositoryFactory.getCurrencies().toPromise();
      let fee = maxFee;
      if (fee < 100) {
        fee = 100;
      } else if (fee > 2000000) {
        fee = 2000000;
      }

      const transferTransaction = TransferTransaction.create(
        Deadline.create(epochAdjustment),
        recipientAddress,
        [currency.createRelative(0)],
        PlainMessage.create(message),
        networkType,
        UInt64.fromUint(fee),
      ).setMaxFee(fee);
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

export const calcTransactionFee = async () => {
  const nodeUrl = NODE_URL;
  const repositoryHttp = new RepositoryFactoryHttp(nodeUrl);
  const networkHttp = repositoryHttp.createNetworkRepository();
  const transactionFees = await (
    await networkHttp.getTransactionFees().toPromise()
  ).averageFeeMultiplier;
  return transactionFees;
};

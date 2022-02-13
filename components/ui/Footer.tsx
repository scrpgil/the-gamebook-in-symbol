const Footer = (props) => {
  const { readAddress } = props;
  return (
    <div className="text-white text-center text-sm py-1">
      <span
        className="border-b mr-2"
        onClick={() => {
          let url = 'https://testnet.symbol.fyi/accounts/' + readAddress?.address;
          window.open(url, '_blank');
        }}
      >
        explorer
      </span>
      <span>
        created by 2022.{' '}
        <a
          href="https://github.com/scrpgil/the-gamebook-in-symbol"
          rel="noreferrer"
          target="_blank"
        >
          github
        </a>
      </span>
    </div>
  );
};
export default Footer;

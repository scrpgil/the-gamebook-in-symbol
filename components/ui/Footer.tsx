import { SYMBOL_EXPLORER } from 'services/const';

const Footer = (props) => {
  const { readAddress } = props;
  return (
    <div className="text-white text-center text-sm py-1">
      <span
        className="border-b mr-2 cursor-pointer	"
        onClick={() => {
          let url = SYMBOL_EXPLORER + 'accounts/' + readAddress?.address;
          window.open(url, '_blank');
        }}
      >
        explorer
      </span>
      <span
        className="border-b mr-2 cursor-pointer	"
        onClick={() => {
          location.hash = '#%E7%99%BB%E9%8C%B2(regist)';
        }}
      >
        regist
      </span>
      <span
        className="border-b mr-2 cursor-pointer	"
        onClick={() => {
          location.hash = '#%E6%9B%B8%E3%81%8D%E8%BE%BC%E3%81%BF(write)';
        }}
      >
        write
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

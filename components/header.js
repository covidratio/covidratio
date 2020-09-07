import Link from 'next/link';
import Logo from './logo';

function Header({ children }) {
  return (
    <header className="row mt-2">
      <div className="col d-flex align-items-center">
        <h1>{children}</h1>
      </div>
      <div className="col-auto d-flex align-items-center">
        <Link href="/">
          <a className="d-block mb-2">
            <Logo />
          </a>
        </Link>
      </div>
    </header>
  );
}
export default Header;

import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="main-content">
        <div className="surface card stack" role="alert">
          <h1>Ruang ini belum dapat dibuka.</h1>
          <p>
            Muat ulang untuk mencoba kembali. Perubahan yang belum disimpan ke
            server tidak tersimpan.
          </p>
          <button className="button" onClick={() => window.location.reload()}>
            Muat ulang aplikasi
          </button>
        </div>
      </main>
    ) : (
      this.props.children
    );
  }
}

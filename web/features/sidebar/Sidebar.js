import React from 'react';

export default class Sidebar extends React.Component {
  render() {
    return (
      <div>
        <ul className="menu vertical">
          <li><a href="/tcp">TCP</a></li>
          <li><a href="/dns">DNS</a></li>
          <li><a href="/netflow">Netflow</a></li>
        </ul>
      </div>
    );
  }
}
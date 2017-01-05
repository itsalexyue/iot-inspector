const LinkCell = ({rowIndex, data, col, ...props}) => (
  <Cell {...props}>
    <a href="#">{data.getObjectAt(rowIndex)[col]}</a>
  </Cell>
);

const TextCell = ({rowIndex, data, col, ...props}) => (
  <Cell {...props}>
    {data.getObjectAt(rowIndex)[col]}
  </Cell>
);

module.exports = {
  LinkCell,
  TextCell
};
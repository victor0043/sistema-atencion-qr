const bcrypt = require('bcrypt');
const hash = '$2b$10$0JiN5Jd.l3GN8jb.YDOPz.yRj1XlsjOnn2u4SgkXd5/zY6/hXCQki';
(async () => {
  const match = await bcrypt.compare('admin123', hash);
  console.log(match);
})();

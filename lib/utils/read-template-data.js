const fs = require('fs')
const path = require('path')

const TEMPLATE_PATH = '../../config/template-repo.json';

exports.readTemplateFromJson = () => JSON.parse(
  fs.readFileSync(
    path.join(__dirname, TEMPLATE_PATH),
    'utf8'
  )
)


exports.writeTemplateToJson = json => fs.writeFileSync(
  path.join(__dirname, TEMPLATE_PATH),
  JSON.stringify(json),
  'utf8'
)
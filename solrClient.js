// backend/solrClient.js
import solr from 'solr-client';

const client = solr.createClient({
  host: 'localhost',
  port: 8983,
  core: 'products',
  path: '/solr',
});

client.autoCommit = true;

export default client;

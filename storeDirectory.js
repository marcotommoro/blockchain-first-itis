import { faker } from '@faker-js/faker';
import { filesFromPaths } from 'files-from-path';
import fs from 'fs';
import { NFTStorage } from 'nft.storage';

const NFT_STORAGE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEEyMmNjNTVEQjlGMmZFNjAyMTcwNjIzRWY2MTg1ZkZhM0U4RjdGOTMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4MDQ1MTE3ODg2NSwibmFtZSI6InRlc3QifQ.SuMu40aEfysC0epJhz2Zb1SFqpZKn2gAzlBWCBlyzt8';

const BASEDIR = 'images';
const METADATADIR = 'metadata';

const uploadImages = async () => {
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

  let files = await filesFromPaths([`./${BASEDIR}/`]);

  const cid = await client.storeDirectory(files);
  console.log(`Uploaded at: https://${cid}.ipfs.nftstorage.link/`);
  return cid;
};

const generateMetadata = async (cid) => {
  //check if metadata folder exists
  if (fs.existsSync(`./${METADATADIR}`))
    fs.rmdirSync(`./${METADATADIR}`, { recursive: true, force: true });

  fs.mkdirSync(`./${METADATADIR}`);

  let files = await filesFromPaths([`./${BASEDIR}/`]);
  const length = files.length;

  for (let i = 0; i < length; i++) {
    const meta = {
      name: faker.name.firstName(),
      description: faker.hacker.phrase(),
      image: `https://${cid}.ipfs.nftstorage.link/${i}.jpg`,
      attributes: generateRandomAttributes(4),
    };
    fs.writeFileSync(`${METADATADIR}/${i}`, JSON.stringify(meta));
  }
};

const uploadMetadata = async () => {
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

  let files = await filesFromPaths([`./${METADATADIR}/`]);
  console.log('files', files);

  const cid = await client.storeDirectory(files);
  console.log(`Uploaded at: https://${cid}.ipfs.nftstorage.link/`);
  return cid;
};

const main = async () => {
  let CID;

  switch (process.argv[2]) {
    case 'images':
      CID = uploadImages();
      console.log(CID);
      break;
    case 'metadata':
      if (process.argv[3] === undefined) return console.log('CID is required');
      CID = process.argv[3];
      await generateMetadata(CID);
      uploadMetadata();
      break;

    default:
      console.log('Invalid command');
      console.log('Usage: node storeDirectory.js [images|metadata] [CID]');
  }
};

const generateRandomAttributes = (attributeNumber) => {
  const traitTypes = ['Background', 'Hair Color', 'Eye Color', 'Accessories'];
  const values = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];

  const attributes = [];

  for (let i = 0; i < attributeNumber; i++) {
    const randomTraitType = traitTypes[i];
    const randomValue = values[Math.floor(Math.random() * values.length)];

    attributes.push({
      trait_type: randomTraitType,
      value: randomValue,
    });
  }
  console.log(attributes);
  return attributes;
};

main();

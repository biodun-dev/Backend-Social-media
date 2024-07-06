import NodeCache from "node-cache";

const stdTTL = 30;

const cache = new NodeCache({ stdTTL });

export default cache;

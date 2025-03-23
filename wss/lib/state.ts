export default class State {
  currentRequestIdx: number;
  requests: Array<{
    uuid: string;
    content: string;
    timestamp: number;
    result: boolean;
  }>;

  constructor() {
    this.currentRequestIdx = -1;
    this.requests = [];
  }

  getCurrentRequest() {
    return this.requests[this.currentRequestIdx];
  }
  getCurrentCommand() {
    // return "time set midnight";
    const currentRequest = this.getCurrentRequest();
    if (currentRequest) {
      return currentRequest.content;
    }
    return "";
  }
  addRequest(content: string) {
    const uuid = crypto.randomUUID();
    this.requests.push({
      uuid,
      content,
      timestamp: Date.now(),
      result: false,
    });
    this.currentRequestIdx = this.requests.length - 1;
    return uuid;
  }
  setRequestResult(result: boolean) {
    const currentRequest = this.getCurrentRequest();
    if (currentRequest) {
      currentRequest.result = result;
    }
  }
  removeRequest() {
    this.requests.splice(this.currentRequestIdx, 1);
    this.currentRequestIdx = this.requests.length - 1;
  }
  

  clearRequests() {
    this.requests = [];
    this.currentRequestIdx = -1;
  }
}

import { webAPI, } from '@/constants/Web';
import storage from '@/storage';
import axios, { AxiosResponse, } from 'axios';

axios.defaults.withCredentials = true;

export default class HttpService
{
  _domain = webAPI;
  _url = `${this._domain}`;
  _timeout = 10000;

  get domain() {
    return this._domain;
  }

  get url() {
    return this._url;
  }

  get timeout() {
    return this._timeout;
  }

  async postData<T = any, R = AxiosResponse<T>> (
    path: Path,
    item: Item,
    tokenId: TokenID = ""
  ): Promise<R> {
    let requestOptions = this.postRequestOptions({ item, });
    if (tokenId.length) {
      const tokenStorage = await storage
        .load({
          key: tokenId,
          autoSync: true,
          syncInBackground: false,
        })
        .then(res => res)
        .catch((err: Error) => err);
      if (tokenStorage && tokenStorage.token) {
        requestOptions = this.postRequestOptions({
          token: tokenStorage.token,
          item,
        });
      }
    }
    
    return axios.post<T, R>(
      this.url+path,
      requestOptions.data,
      { headers: requestOptions.headers, timeout: this.timeout, },
    );
  }

  async postFormData<T = any, R = AxiosResponse<T>> (
    path: Path,
    formData: FormData,
    tokenId: TokenID = ""
  ): Promise<R> {
    const headers: { [key: string]: any } = { 'Content-Type': 'multipart/form-data', };
    if (tokenId.length) {
      const tokenStorage = await storage
        .load({
          key: tokenId,
          autoSync: true,
          syncInBackground: false,
        })
        .then(res => res)
        .catch((err: Error) => err);
      if (tokenStorage && tokenStorage.token) {
        headers.Authorization = 'Bearer ' + tokenStorage.token;
      }
    }

    return axios.post<T, R>(
      this.url+path,
      formData,
      { headers, timeout: this.timeout, },
    );
  }

  async getData<T = any, R = AxiosResponse<T>> (
    path: Path,
    tokenId: TokenID = "",
  ): Promise<R> {
    let requestOptions = this.getRequestOptions();
    if (tokenId.length) {
      const tokenStorage = await storage
        .load({
          key: tokenId,
          autoSync: true,
          syncInBackground: false,
        })
        .then(res => res)
        .catch((err: Error) => err);
      if (tokenStorage && tokenStorage.token) {
        requestOptions = this.getRequestOptions(
          tokenStorage.token,
        );
      }
    }
    let url = this.url+path;
    if (null !== path.match(/http/g)) {
      url = path;
    }
    return axios.get<T, R>(
      url, 
      { headers: requestOptions.headers, timeout: this.timeout, }
    );
  }

  async patchData<T = any, R = AxiosResponse<T>> (
    path: Path,
    item: Item,
    tokenId: TokenID = ""
  ): Promise<R> {
    let requestOptions = this.patchRequestOptions({ item, });
    if (tokenId.length) {
      const tokenStorage = await storage
        .load({
          key: tokenId,
          autoSync: true,
          syncInBackground: false,
        })
        .then(res => res)
        .catch((err: Error) => err);
      if (tokenStorage && tokenStorage.token) {
        requestOptions = this.patchRequestOptions({
          token: tokenStorage.token,
          item,
        });
      }
    }
    
    return axios.patch<T, R>(
      this.url+path,
      requestOptions.data,
      { headers: requestOptions.headers, timeout: this.timeout, },
    );
  }

  async deleteData<T = any, R = AxiosResponse<T>> (
    path: Path,
    tokenId: TokenID = ""
  ): Promise<R> {
    let requestOptions = this.deleteRequestOptions();
    if (tokenId.length) {
      const tokenStorage = await storage
        .load({
          key: tokenId,
          autoSync: true,
          syncInBackground: false,
        })
        .then(res => res)
        .catch((err: Error) => err);
      if (tokenStorage && tokenStorage.token) {
        requestOptions = this.deleteRequestOptions(
          tokenStorage.token,
        );
      }
    }
    
    return axios.delete<T, R>(
      this.url+path,
      { headers: requestOptions.headers, timeout: this.timeout, },
    );
  }

  getRequestOptions(token?: TokenID) {
    const requestOptions: RequestOptions = {
      method: 'GET',
      headers: { 'Content-type' : 'application/json', }
    };
    if (token) {
      requestOptions.headers.Authorization = 'Bearer ' +token;
    }
    return requestOptions;
  }

  postRequestOptions (
    { token, item, } : {
      token?: TokenID,
      item: Item,
    }
  ) {
    const requestOptions: RequestOptions = {
      method: 'POST',
      headers: { 'Content-type' : 'application/json', },
      data : item,
    };
    if (token) {
      requestOptions.headers.Authorization = 'Bearer ' +token;
    }
    return requestOptions;
  }

  patchRequestOptions (
    { token, item, } : {
      token?: TokenID,
      item: Item,
    }
  ) {
    const requestOptions: RequestOptions = {
      method: 'PATCH',
      headers: { 'Content-type' : 'application/json', },
      data : item,
    };
    if (token) {
      requestOptions.headers.Authorization = 'Bearer ' +token;
    }
    return requestOptions;
  }

  deleteRequestOptions (token?: TokenID) {
    const requestOptions: RequestOptions = {
      method: 'DELETE',
      headers: { 'Content-type' : 'application/json', },
    };
    if (token) {
      requestOptions.headers.Authorization = 'Bearer ' +token;
    }
    return requestOptions;
  }
}

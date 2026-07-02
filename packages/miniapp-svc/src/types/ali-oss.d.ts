declare module 'ali-oss' {
  interface OSSOptions {
    endpoint?: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
  }

  interface PutResult {
    name: string;
    url: string;
    res: { status: number };
  }

  class OSS {
    constructor(options: OSSOptions);
    put(name: string, file: Buffer | string): Promise<PutResult>;
  }

  export = OSS;
}

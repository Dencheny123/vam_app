export type ServerResponseType<DataType> = {
  message: string;
  statusCode: number;
  error: string | null;
  data: DataType;
};



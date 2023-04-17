export const globalContext = {
  data: {} as any,
  setData: function (shipmentId: string, data: any) {
    this.data[shipmentId] = data;
  },
  getData: function (shipmentId: string) {
    return this.data[shipmentId];
  },
};

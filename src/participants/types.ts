import { SFCAPI } from './clients/sfc-api';

export type SFCAPIType = typeof SFCAPI;

export type EmissionDataModel = {
  id_tce: string;
  id_consignment: string;
  id_shipment: string;
  transport_activity: number;
  mass: number;
  actual_distance: number;
  mode_of_transport: string;
  asset_type: string;
  co2_wtw: number;
  load_factor: number;
  empty_distance: number;
  energy_carrier_N: string;
  Feedstock_N: string;
};

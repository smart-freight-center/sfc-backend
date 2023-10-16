import { Addresses } from '@think-it-labs/edc-connector-client';

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
  loading_date: string;
  unloading_date: string;
  verification: string;
  accreditation: string;
};

export type Participant = {
  company_name: string;
  client_id: string;
  company_BNP: string;
  role: 'shipper' | 'lsp';
  connection: string[];
  public_key: string;
  connector_data: {
    id: string;
    addresses: Addresses;
  };
};

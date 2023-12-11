import { Addresses } from '@think-it-labs/edc-connector-client';

export type EmissionDataModel = {
  id_tce: string;
  id_tce_order: string;
  id_consignment: string;
  id_shipment: string;
  transport_activity: number;
  mass: number;
  empty_distance_factor: number;
  empty_distance_factor_add_information: string;
  load_factor_add_information?: string;
  co2e_ttw: number;
  co2e_wtw: number;
  distance_actual?: number;
  co2e_intensity_wtw_unit: string;
  co2e_intensity_wtw: number;
  WTW_fuel_emission_factor?: number;
  energy_carrier_feedstock_N: string;
  temp_control: string;
  transport_operator_name: string;
  distance_activity: number;
  mode_of_transport: string;
  asset_type?: string;
  load_factor: number;
  empty_distance: number;
  energy_carrier_N: string;
  Feedstock_N: string;
  unloading_city: string;
  unloading_country: string;
  loading_country: string;
  loading_city: string;
  loading_date: string;
  unloading_date: string;
  verification: boolean;
  accreditation: boolean;
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

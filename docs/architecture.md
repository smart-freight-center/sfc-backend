## Architecture

You can view the Component Level Architecture of the project [here](<https://file.notion.so/f/f/c197f67d-0356-418c-9bc3-42457603c627/38a50fd7-42ee-4d96-8cb0-1f8e593e5bdc/SFC_Data_Exchange_(3).pdf?id=7962b526-5bee-408f-891e-ba6c8521aa20&table=block&spaceId=c197f67d-0356-418c-9bc3-42457603c627&expirationTimestamp=1710892800000&signature=52VdodH5Fe54dUTbgR_3f6B4Y03I-Kt4dMt4QY9NuVM&downloadName=SFC+Data+Exchange+%283%29.pdf>)

## Zooming in on Participant Section of the Diagram

The Participant section of the diagram would be deployed on each participant's network as a single unit. We packaged this into a helmchart that can be easily deployed in a cloud agnostic way.

The main components of this software as shown in the diagram are:

- KeyCloak
- EDC Connector
- Redis
- The SFC Exchange API

### KeyCloak

KeyCloak is used to authenticate each participant in the network, using a decentralized approach.

Each participant has a Keycloak instance which allows them to change the username and password need to access the API endpoints and also add as many users as they want.

During setup the client_id and public_key of the Keycloak instance would be shared with the SFC Unit. This allows the SFC Unit to be able to authenticate each participant in the network and allow participants to share data with only the people they are connected to.

This allows the participants to have full control of who has access to the SFC Exchange API endpoints.

### EDC Connector

The [EDC connector](https://github.com/eclipse-edc/Connector) is used to share data with participant in the network in a way that ensures data soverenity. This means that the data resides on the Participants network(eg their S3 bucket or some HTTP endpoint) and is never copied to any central.

Thus each participant has full control of the data they share with others and can easily revoke it at anytime if needed.

### The SFC Exchange API

This repo contains code for the SFC Exchange API. The API provides the following features to the users:

- Run Data model validation on both data source and a file
- Share carbon footprint data in a decentralized way using the EDC connector
- Revoke access of assets that have been previously shared

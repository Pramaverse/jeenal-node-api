import {Document, Schema} from 'mongoose';

export interface IAddress extends Document {
    street: string;
    city: string;
    state: string;
    zip: string;
}
export const addressSchema:Schema<IAddress> = new Schema<IAddress>({
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
        validate: {
            validator: function (v: string) {
                return [
                    "AL",
                    "AK",
                    "AZ",
                    "AR",
                    "CA",
                    "CO",
                    "CT",
                    "DE",
                    "FL",
                    "GA",
                    "HI",
                    "ID",
                    "IL",
                    "IN",
                    "IA",
                    "KS",
                    "KY",
                    "LA",
                    "ME",
                    "MD",
                    "MA",
                    "MI",
                    "MN",
                    "MS",
                    "MO",
                    "MT",
                    "NE",
                    "NV",
                    "NH",
                    "NJ",
                    "NM",
                    "NY",
                    "NC",
                    "ND",
                    "OH",
                    "OK",
                    "OR",
                    "PA",
                    "RI",
                    "SC",
                    "SD",
                    "TN",
                    "TX",
                    "UT",
                    "VT",
                    "VA",
                    "WA",
                    "WV",
                    "WI",
                    "WY",
                ].includes(v);
            },
            message: (props: any) => `${props.value} is not a valid US state`,
        },
    },
    zip: {
        type: String,
        required: true,
        validate: {
            validator: function (v: string) {
                // Check that the ZIP code is a valid US ZIP code
                return /^\d{5}(-\d{4})?$/.test(v);
            },
            message: (props: any) => `${props.value} is not a valid US ZIP code`,
        },
    },
});
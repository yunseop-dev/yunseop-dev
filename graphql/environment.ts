const defaultPort = 4000;

interface Environment {
    apollo: {
        introspection: boolean;
        playground: boolean;
    };
    mongoDb: {
        databaseName: string;
        user: string;
        password: string;
        url: string;
    }
}

const environment: Environment = {
    apollo: {
        introspection: process.env.APOLLO_INTROSPECTION === 'true',
        playground: process.env.APOLLO_PLAYGROUND === 'true',
    },
    mongoDb: {
        databaseName: process.env.COSMOSDB_DBNAME,
        user: process.env.COSMOSDB_USER,
        password: process.env.COSMOSDB_PASSWORD,
        url: "mongodb://" + process.env.COSMOSDB_HOST + ":" + process.env.COSMOSDB_PORT + "/" + process.env.COSMOSDB_DBNAME + "?ssl=true&replicaSet=globaldb&retrywrites=false",
    }
};

export default environment;
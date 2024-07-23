import PraxOnly from "./PraxOnly";
import {JsonValue} from "@bufbuild/protobuf";

// Function to handle BigInt serialization
function serializeBigInt(data: JsonValue) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

export default function AppParameters() {
  return (
    <PraxOnly
      fallback={<span>Connect wallet to view parameters</span>}
      imports={{
        useAppParameters: () => import("~/hooks.client/useAppParameters"),
        ReactJson: () => import("@microlink/react-json-view"),
      }}
    >
      {({ useAppParameters, ReactJson }) => {
        const Content = () => {
          const { data, error, isLoading } = useAppParameters.default();

          if (isLoading) return <span>Loading...</span>;
          if (error) return <span>Error: {error.message}</span>;
          if (!data) return <span>No data</span>;

          // Serialize the data, converting BigInts to strings
          const serializedData = serializeBigInt(data);

          return (
            <div>
              <h1>App Parameters</h1>
              <ReactJson.default
                src={serializedData}
                theme="monokai"
                collapsed={true}
                name={false}
                displayObjectSize={false}
                displayDataTypes={false}
                style={{ background: "#0000", fontSize: "14pt" }}
              />
            </div>
          );
        };

        return <Content />;
      }}
    </PraxOnly>
  );
}

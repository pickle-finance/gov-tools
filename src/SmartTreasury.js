import React, { useState } from "react";
import { ethers } from "ethers";
import { Spacer } from "./Spacer";

import { Form, Card, Button } from "react-bootstrap";

import { ADDRESSES } from "./constants";

import bactionsAbi from "./abi/bactions.json";

const getFunctionSigs = (abi) => {
  return abi
    .map((x) => {
      if (x.type !== "function") {
        return null;
      }
      if (x.stateMutability === "view") {
        return null;
      }
      if (x.stateMutability === "pure") {
        return null;
      }
      return `${x.name}(${x.inputs.map((y) => y.type).join(",")})`;
    })
    .filter((x) => x !== null);
};

function Encode({ crpAddress, poolAddress, targetAddress, proxyAddress, abi }) {
  const functionSigs = getFunctionSigs(abi);
  const [functionSig, setFunctionSig] = useState(functionSigs[0]);
  const [params, setParams] = useState("");
  const [data, setData] = useState("");

  return (
    <>
      <Spacer y={15} />

      <Card>
        <Card.Body>
          <h4>Contract Interaction</h4>

          <Form>
            <Form.Group>
              <Form.Label>Recipient</Form.Label>
              <Form.Control type="text" value={proxyAddress} disabled />
            </Form.Group>

            <Form.Group>
              <Form.Label>Function Sig</Form.Label>
              <Form.Control type="text" value="execute" disabled />
            </Form.Group>

            <Card>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Value</Form.Label>
                  <Form.Control type="text" value={"0"} disabled />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Target</Form.Label>
                  <Form.Control type="text" value={targetAddress} disabled />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Data</Form.Label>

                  <Card>
                    <Card.Body>
                      <Form.Group>
                        <Form.Label>Pool Address</Form.Label>
                        <Form.Control
                          type="text"
                          value={poolAddress}
                          disabled
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>
                          CRP Address (Controller / ERC20 Token)
                        </Form.Label>
                        <Form.Control type="text" value={crpAddress} disabled />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>Function Call</Form.Label>
                        <Form.Control
                          as="select"
                          onChange={(e) => {
                            setFunctionSig(e.target.value);
                            setData("");
                          }}
                        >
                          {functionSigs.map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>Function Param</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={`${Array(
                            functionSig.split("").filter((x) => x === ",")
                              .length + 1
                          )
                            .fill(0)
                            .map((x, i) => i)
                            .join(",")}`}
                          value={params}
                          onChange={(e) => setParams(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Control
                          as="textarea"
                          rows="3"
                          value={data}
                          disabled
                        />
                      </Form.Group>

                      <Button
                        block
                        onClick={(e) => {
                          e.preventDefault();

                          try {
                            const functionName = functionSig.split("(")[0];
                            const functionParams = functionSig
                              .split("(")[1]
                              .split(")")[0]
                              .split(",")
                              .filter((x) => x !== "");

                            if (functionParams.length === 0) {
                              setData("");
                              return;
                            }

                            // Fix for arrays
                            const paramsFixedWithArrays = params
                              .split(",")
                              .map((x) => x.split(" ").join(""))
                              .map((x, i) => {
                                if (functionParams[i] === "bool") {
                                  if (x === "true") {
                                    return true;
                                  } else if (x === "false") {
                                    return false;
                                  }
                                  return null;
                                }
                                return x;
                              })
                              .reduce((acc, x) => {
                                // If accumulator has stuff
                                const lastItem = acc.slice(-1)[0];

                                if (lastItem) {
                                  // If the array has completed
                                  if (
                                    lastItem.indexOf("[") ===
                                    lastItem.indexOf("]")
                                  ) {
                                    // Append x to accumulator
                                    return [...acc, x];
                                  }

                                  // Else keep appending
                                  const reverseTail = acc.slice(0, -1);
                                  return [...reverseTail, lastItem + "," + x];
                                }

                                return [...acc, x];
                              }, [])
                              .map((x) => {
                                if (x.indexOf("[") !== -1) {
                                  return x
                                    .replace("[", "")
                                    .replace("]", "")
                                    .split(",")
                                    .map((y) => `${y}`);
                                }
                                return x;
                              });

                            const IEncoder = new ethers.utils.Interface(abi);

                            const encodedData = IEncoder.encodeFunctionData(
                              functionName,
                              paramsFixedWithArrays
                            );

                            setData(encodedData);
                          } catch (e) {
                            setData(e.toString());
                          }
                        }}
                        variant="primary"
                        type="submit"
                      >
                        Encode
                      </Button>
                    </Card.Body>
                  </Card>
                </Form.Group>
              </Card.Body>
            </Card>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

function EncodeSelector() {
  const contracts = {
    "Pickle Smart Treasury (90 PICKLE / 10 WETH)": {
      poolAddress: ADDRESSES.SmartTreasury,
      crpAddress: ADDRESSES.SmartTreasuryToken,
      proxyAddress: ADDRESSES.GovernanceProxy,
      targetAddress: ADDRESSES.BActions,
      abi: bactionsAbi,
    },
  };

  const [selectedContract, setSelectedContract] = useState(
    contracts["Pickle Smart Treasury (90 PICKLE / 10 WETH)"]
  );

  return (
    <>
      <Spacer y={20} />

      <Form.Group>
        <Form.Label>
          <h3>Contract</h3>
        </Form.Label>
        <Form.Control
          as="select"
          onChange={(e) => {
            setSelectedContract(contracts[e.target.value]);
          }}
        >
          {Object.keys(contracts).map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Form.Control>
      </Form.Group>

      <Encode {...selectedContract} />
    </>
  );
}

export default EncodeSelector;

import React, { useState, useEffect } from "react";
import { Spacer } from "./Spacer";
import { ethers } from "ethers";

import { Form, Button, Card } from "react-bootstrap";

import { ADDRESSES } from "./constants";

import masterchefAbi from "./abi/masterchef.json";
import controllerAbi from "./abi/controller-v2.json";
import pickleJarAbi from "./abi/pickle-jar.json";
import strategySCRVv3Abi from "./abi/strategy-scrv-v3.json";
import strategyUniEthV3Abi from "./abi/strategy-uni-eth-lp-v3.json";

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

const masterchefFunctionSigs = getFunctionSigs(masterchefAbi);
const pickleJarFunctionSigs = getFunctionSigs(pickleJarAbi);
const strategySCRVv3FunctionSigs = getFunctionSigs(strategySCRVv3Abi);
const strategyUniEthV3FunctionSigs = getFunctionSigs(strategyUniEthV3Abi);
const controllerFunctionSigs =  getFunctionSigs(controllerAbi);

const HOUR = 60 * 60;

function Encode({ functionSigs, recipient, target, timelockDuration }) {
  const [functionSig, setFunctionSig] = useState(functionSigs[0]);
  const [params, setParams] = useState("");
  const [data, setData] = useState("");
  const [hoursFromNow, setHoursFromNow] = useState(timelockDuration + 1);
  const [eta, setEta] = useState(
    parseInt((new Date().getTime() / 1000).toString()) +
      parseInt(hoursFromNow) * HOUR
  );

  const updateEta = (hfn) => {
    try {
      const newEta =
        parseInt((new Date().getTime() / 1000).toString()) +
        parseInt(hfn) * HOUR;

      setEta(newEta.toString());
    } catch (e) {
      setEta(e.toString());
    }
  };

  useEffect(() => {
    if (hoursFromNow !== timelockDuration + 1) {
      setHoursFromNow(timelockDuration + 1);
      updateEta(timelockDuration + 1);
    }
  }, [hoursFromNow, timelockDuration]);

  return (
    <>
      <Spacer y={15} />

      <Card>
        <Card.Body>
          <h4>Contract Interaction</h4>

          <Form>
            <Form.Group>
              <Form.Label>Recipient</Form.Label>
              <Form.Control type="text" value={recipient} disabled />
            </Form.Group>
            <Form.Group>
              <Form.Label>Function Sig</Form.Label>
              <Form.Control
                type="text"
                value={"queueTransaction | execTransaction"}
                disabled
              />
            </Form.Group>

            <Card>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Target</Form.Label>
                  <Form.Control type="text" value={target} disabled />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Value</Form.Label>
                  <Form.Control type="text" value={"0"} disabled />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Signature</Form.Label>
                  <Form.Control type="text" value={functionSig} disabled />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Data</Form.Label>

                  <Card>
                    <Card.Body>
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
                            const functionParams = functionSig
                              .split("(")[1]
                              .split(")")[0]
                              .split(",")
                              .filter((x) => x !== "");

                            if (functionParams.length === 0) {
                              setData("");
                              return;
                            }

                            // Converts bool from string to bool etc
                            const paramsFixed = params
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
                              });

                            const encodedData = ethers.utils.defaultAbiCoder.encode(
                              functionParams,
                              paramsFixed
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
                <Form.Group>
                  <Form.Label>ETA</Form.Label>

                  <Card>
                    <Card.Body>
                      <Form.Group>
                        <Form.Label>Hours From Now</Form.Label>
                        <Form.Control
                          type="text"
                          value={hoursFromNow}
                          onChange={(e) => setHoursFromNow(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Control type="text" value={`${eta}`} disabled />
                      </Form.Group>

                      <Button
                        block
                        onClick={(e) => {
                          e.preventDefault();
                          updateEta(hoursFromNow);
                        }}
                        variant="primary"
                        type="submit"
                      >
                        Get ETA
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
    "Masterchef (48 hr)": {
      recipient: ADDRESSES.Timelock_48,
      target: ADDRESSES.Masterchef,
      timelockDuration: 48,
      functionSigs: masterchefFunctionSigs,
    },
    "Masterchef (24 hr)": {
      recipient: ADDRESSES.Timelock_24,
      target: ADDRESSES.Masterchef,
      timelockDuration: 24,
      functionSigs: masterchefFunctionSigs,
    },
    "Controller v2 (12 hr)": {
      recipient: ADDRESSES.Timelock_12,
      target: ADDRESSES.ControllerV2,
      timelockDuration: 12,
      functionSigs: controllerFunctionSigs,
    },
    "psCRV (12 hr)": {
      recipient: ADDRESSES.Timelock_12,
      target: ADDRESSES.psCRV,
      timelockDuration: 12,
      functionSigs: pickleJarFunctionSigs,
    },
    "psUNIv2-ETH-DAI (12 hr)": {
      recipient: ADDRESSES.Timelock_12,
      target: ADDRESSES.psUNIv2_ETH_DAI,
      timelockDuration: 12,
      functionSigs: pickleJarFunctionSigs,
    },
    "psUNIv2-ETH-USDC (12 hr)": {
      recipient: ADDRESSES.Timelock_12,
      target: ADDRESSES.psUNIv2_ETH_USDC,
      timelockDuration: 12,
      functionSigs: pickleJarFunctionSigs,
    },
    "psUNIv2-ETH-USDT (12 hr)": {
      recipient: ADDRESSES.Timelock_12,
      target: ADDRESSES.psUNIv2_ETH_USDT,
      timelockDuration: 12,
      functionSigs: pickleJarFunctionSigs,
    },
    "StrategyCurveSCRVv3 (12 hr)": {
      recipient: ADDRESSES.Timelock_12,
      target: ADDRESSES.StrategyCurveSCRVv3,
      timelockDuration: 12,
      functionSigs: strategySCRVv3FunctionSigs,
    },
    "StrategyUniEthDaiLpV3 (12 hr)": {
      recipient: ADDRESSES.Timelock_12,
      target: ADDRESSES.StrategyUniEthDaiLpV3,
      timelockDuration: 12,
      functionSigs: strategyUniEthV3FunctionSigs,
    },
    "StrategyUniEthUsdcLpV3 (12 hr)": {
      recipient: ADDRESSES.Timelock_12,
      target: ADDRESSES.StrategyUniEthUsdcLpV3,
      timelockDuration: 12,
      functionSigs: strategyUniEthV3FunctionSigs,
    },
    "StrategyUniEthUsdtLpV3 (12 hr)": {
      recipient: ADDRESSES.Timelock_12,
      target: ADDRESSES.StrategyUniEthUsdtLpV3,
      timelockDuration: 12,
      functionSigs: strategyUniEthV3FunctionSigs,
    },
  };

  const [selectedContract, setSelectedContract] = useState(
    contracts["Masterchef (48 hr)"]
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

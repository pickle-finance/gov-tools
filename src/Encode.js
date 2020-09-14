import React, { useState } from "react";
import { Spacer } from "./Spacer";
import { ethers } from "ethers";

import { Form, Button, Card } from "react-bootstrap";

import { ADDRESSES } from "./constants";

import masterchefAbi from "./abi/masterchef.json";

const masterchefFunctionSigs = masterchefAbi
  .map((x) => {
    if (x.type !== "function") {
      return null;
    }
    return `${x.name}(${x.inputs.map((y) => y.type).join(",")})`;
  })
  .filter((x) => x !== null);

const HOUR = 60 * 60;

function Encode() {
  const [functionSig, setFunctionSig] = useState(masterchefFunctionSigs[0]);
  const [params, setParams] = useState("");
  const [data, setData] = useState("");
  const [eta, setEta] = useState(
    parseInt((new Date().getTime() / 1000).toString()) + 49 * HOUR
  );
  const [hoursFromNow, setHoursFromNow] = useState(49);

  return (
    <>
      <Spacer y={15} />

      <Card>
        <Card.Body>
          <h4>Contract Interaction</h4>

          <Form>
            <Form.Group>
              <Form.Label>Recipient</Form.Label>
              <Form.Control type="text" value={ADDRESSES.Timelock} disabled />
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
                  <Form.Control
                    type="text"
                    value={ADDRESSES.Masterchef}
                    disabled
                  />
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
                          {masterchefFunctionSigs.map((x) => (
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

                          try {
                            const newEta =
                              parseInt(
                                (new Date().getTime() / 1000).toString()
                              ) +
                              parseInt(hoursFromNow) * HOUR;

                            setEta(newEta.toString());
                          } catch (e) {
                            setEta(e.toString());
                          }
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

export default Encode;

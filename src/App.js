import React from "react";
import { Steps, Input, Button, Form, Result } from 'antd';
import { useStepsForm } from 'sunflower-antd';
import NimbleInstitutionsAPI from './models/NimbleInstitutionsAPI';

import './App.css';

const { Step } = Steps;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const App = () => {
  const {
    form,
    current,
    gotoStep,
    stepsProps,
    formProps,
    submit,
    formLoading,
  } = useStepsForm({
    async submit(values) {
      const { username, email, address } = values;
      console.log(username, email, address);
      await new Promise(r => setTimeout(r, 1000));
      return 'ok';
    },
    total: 3,
  });

  let domainMeta = {};

  const formList = [
    <>
      <Form.Item label="Email" name="email" 
        rules={[
          {
            required: true,
            type: "email",
            message: "Please input valid E-mail"
          },
        ]}
      >
        <Input placeholder="Email" />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button onClick={async () => {
          let email = form.getFieldValue('email');
          domainMeta = await NimbleInstitutionsAPI.getDomainMeta(email.split('@')[1]);
          console.log(domainMeta);
          gotoStep(current + 1)
        }}>Next</Button>
      </Form.Item>
    </>,

    <>
      <span>{domainMeta.domain}</span>
      <Form.Item
        label="Address"
        name="address"
        rules={[
          {
            required: true,
            message: 'Please input address',
          },
        ]}
      >
        <Input placeholder="Address" />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button
          style={{ marginRight: 10 }}
          type="primary"
          loading={formLoading}
          onClick={() => {
            submit().then(result => {
              if (result === 'ok') {
                gotoStep(current + 1);
              }
            });
          }}
        >
          Submit
        </Button>
        <Button onClick={() => gotoStep(current - 1)}>Prev</Button>
      </Form.Item>
    </>,
  ];

  return (
    <div>
      <Steps {...stepsProps}>
        <Step title="First" />
        <Step title="Second" />
        <Step title="Third" />
      </Steps>

      <div style={{ marginTop: 60 }}>
        <Form {...layout} {...formProps} style={{ maxWidth: 600 }}>
          {formList[current]}
        </Form>

        {current === 2 && (
          <Result
            status="success"
            title="Submit is succeed!"
            extra={
              <>
                <Button
                  type="primary"
                  onClick={() => {
                    form.resetFields();
                    gotoStep(0);
                  }}
                >
                  Buy it again
                </Button>
                <Button>Check detail</Button>
              </>
            }
          />
        )}
      </div>
    </div>
  );
};

export default App;
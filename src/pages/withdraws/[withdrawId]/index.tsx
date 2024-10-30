import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import Button from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import SelectInput from '@/components/ui/select-input';
import ValidationError from '@/components/ui/form-validation-error';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import AdminLayout from '@/components/layouts/admin';
import { useWithdrawQuery } from '@/data/withdraw';
import { useApproveWithdrawMutation } from '@/data/withdraw';
import Card from '@/components/common/card';
import Input from '@/components/ui/input';

type FormValues = {
  status: any;
};
const WithdrawStatus = [
  {
    name: 'Approved',
    id: 'approved',
  },

  {
    name: 'Not Collected',
    id: 'pending',
  },
  {
    name: 'Rejected',
    id: 'rejected',
  },
];

const Withdraw = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    query: { withdrawId },
  } = router;

  const {
    withdraw,
    error,
    isLoading: loading,
  } = useWithdrawQuery({ id: withdrawId as string });

  useEffect(() => {
    if (withdraw?.status) {
      setValue(
        'status',
        WithdrawStatus?.find((status) => status.id === withdraw?.status)
      );
    }
  }, [withdraw?.status]);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();
  const { mutate: approveWithdraw, isLoading: approving } =
    useApproveWithdrawMutation();

  function handleApproveWithdraw({ status }: any) {
    approveWithdraw({
      id: withdrawId as string,
      status: status.id,
    });
  }

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const details=JSON.parse(withdraw?.details||'{}')

  return (
    <>
      <h3 className="mb-6 w-full text-xl font-semibold text-heading">
        {t('common:text-withdrawal-info')}
      </h3>
      <Card className="flex flex-col">
        <div className="flex flex-col items-start ">
          <form
            onSubmit={handleSubmit(handleApproveWithdraw)}
            className="mb-5 flex w-full items-center gap-2 "
          >
            <div className="z-20 w-full me-5">
              <label>{t('form:input-label-status')}</label>
              <SelectInput
                name="status"
                control={control}
                getOptionLabel={(option: any) => option.name}
                getOptionValue={(option: any) => option.id}
                options={WithdrawStatus}
                placeholder={t('form:input-placeholder-order-status')}
                rules={{
                  required: 'form:error-status-required',
                }}
              />

              <ValidationError message={t(errors?.status?.message)} />
            </div>
            <div className="z-20 w-full">
              <lable>{t("rejection-reason")}</lable>
            <input placeholder={t("rejection-reason")} className="bg-white-50 min-h-[45px] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500" />
            </div>
            <Button loading={approving}>
              <span className="hidden sm:block">
                {t('form:button-label-change-status')}
              </span>
              <span className="block sm:hidden">
                {t('form:button-label-change')}
              </span>
            </Button>
          </form>

          <div className="w-full ">
            <div className="mb-2 flex items-center justify-start">
              <div className="flex w-4/12 flex-shrink-0 justify-between text-sm text-body me-5">
                <span>{t('common:text-amount')}</span>
                <span>:</span>
              </div>
              <div className="flex w-full items-center rounded border border-gray-300 px-4 py-3 xl:w-5/12">
                <span className="font-semibold text-heading">
                  {withdraw?.amount}
                </span>
              </div>
            </div>

            <div className="mb-2 flex items-center">
              <div className="flex w-4/12 flex-shrink-0 justify-between text-sm text-body me-5">
                <span>{t('common:text-payment-method')}</span>
                <span>:</span>
              </div>
              <span className="w-full text-sm font-semibold text-heading">
                {withdraw?.payment_method ?? 'N/A'}
              </span>
            </div>

            <div className="flex items-center">
              <div className="flex w-4/12 flex-shrink-0 justify-between text-sm text-body me-5">
                <span>{t('common:text-status')}</span>
                <span>:</span>
              </div>
              <span className="w-full text-sm font-semibold text-heading">
                {
                  WithdrawStatus?.find(
                    (status) => status.id === withdraw?.status
                  )?.name
                }
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {withdraw?.details && (
          <Card className="flex flex-col">
            <div className="mb-2 text-sm font-semibold text-heading">
              <span>{t('common:text-details')} :</span>
            </div>

            <div>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr >
                  <th scope="col" className="px-6 py-3">{t("affiliate")}</th>
                  {Object.keys(details).map((key) => (
                    <td key={key} scope="col" className="px-6 py-3">
                      
                        {t(key)}
                     
                    </td>
                  ))}
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>{withdraw?.customer?.name}</td>
                  {Object.values(details).map((value) => (
                    <td key={value}>
                      {value}
                    </td>
                  ))}
                </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {withdraw?.note && (
          <Card className="flex flex-col">
            <div className="mb-2 text-sm font-semibold text-heading">
              <span>{t('common:text-note')} :</span>
            </div>

            <span className="text-sm text-body">{withdraw?.note}</span>
          </Card>
        )}
      </div>
    </>
  );
};

export default Withdraw;

Withdraw.authenticate = {
  permissions: adminOnly,
};
Withdraw.Layout = AdminLayout;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['table', 'common', 'form'])),
  },
});

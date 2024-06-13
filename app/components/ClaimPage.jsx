import React, {useEffect, useState, Suspense} from 'react';
export function ClaimPage () {
  const [pageStep,setPageStep] = useState(0);
  const [userEmail,setUserEmail] = useState("");
  const [orderNumber,setOrderNumber] = useState("");
  const [shopifyOrderNumber,setShopifyOrderNumber] = useState("");
  const [claimButtonLoading,setClaimButtonLoading] = useState(false);
  const [claimError,setClaimError] = useState("");
  const [customerToken,setCustomerToken] = useState("");
  const [orderData,setOrderData] = useState("");
  const [showPopup,setShowPopup] = useState(false);
  const [fulfilmentId,setFulfilmentId] = useState();
  const [customerNote,setCustomerNote] = useState();
  const [customerNoteError,setCustomerNoteError] = useState(false);
  const [claimSubmitLoading,setClaimSubmitLoading] = useState(false);
  const [claimImages,setClaimImages] = useState();
  const [imagesLoading,setImagesLoading] = useState(false);
  useEffect(()=>{
    if(customerToken){
      fetchOrderData();
    }
  },[customerToken])

  const orderClaimEvent = () => {
    setClaimError("");
    setClaimButtonLoading(true);
    var myHeaders = new Headers();
    myHeaders.append("content-type", "application/json");
    myHeaders.append("shopname", "harshad-dev.myshopify.com");
    var raw = JSON.stringify({
      "customer_email": userEmail,
      "order_number": orderNumber
    });
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };

    fetch("https://harshad-dev.myshopify.com/apps/simplyinsurance/storefront-api/getOrderfulfilmentdata", requestOptions)
    .then(response => response.json())
    .then(result =>{
      if(result && result.status == 0){
        setCustomerToken(result.token);
      }else{
        setClaimError(result.message);
        setClaimButtonLoading(false);
      }
    })
    .catch(error => console.log('error', error));
  }
  const fetchOrderData = () => {
    fetch(`https://harshad-dev.myshopify.com/apps/simplyinsurance/storefront-api/getOrderfulfilmentFront?requested_token=${customerToken}`, {
      method: 'GET',
      headers: {
        'shopname':"harshad-dev.myshopify.com"
      }
    })
    .then(response => response.json())
    .then(result =>{
      console.log(result);
      setOrderData(result.data);
      setShopifyOrderNumber(result.data.shopify_order_id);
      setPageStep(1);
      setClaimButtonLoading(false);
    })
    .catch(error => console.log('error', error));
  }
  let date = '';
  if(orderData){
    date = new Date(orderData.order_created_at);
  }
  const generateClaim = (e) => {
    let that = e.currentTarget;
    let parent = that.closest('.bottom-section-inner');
    setFulfilmentId(parent.getAttribute('data-fulfilment_id'));
    setShowPopup(true);
  }
  const popupClose = () => {
    setShowPopup(false);
  }
  const imageUpload = (e) => {
    setImagesLoading(true);
    let that = e.currentTarget;
    let images = new FormData();
    for(let i=0; i < that.files.length; i++){
      images.append("file[]", that.files[i]);
    }
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json, text/plain, */*");
    myHeaders.append("shopname", "harshad-dev.myshopify.com");
    fetch("https://harshad-dev.myshopify.com/apps/simplyinsurance/storefront-api/handleimages", {
      method: 'POST',
      headers: myHeaders,
      body: images,
    }).then(data=>data.json())
    .then(data=>{
      if (data.status === 0) {
        setClaimImages(data.image_url);
      } else {
        console.log('error');
      }
      setImagesLoading(false);
    })
  }
  const claimSubmitEvent = () => {
    setClaimSubmitLoading(true);
    if(!customerNote || customerNote.length === 0){
      setCustomerNoteError(true);
      setClaimSubmitLoading(false);
      return false;
    }
    let images = claimImages.join(',');
    let passObj = {
      claim_images: images,
      customer_email: userEmail,
      customer_note: customerNote,
      fulfilment_id: fulfilmentId,
      shopify_order_id: shopifyOrderNumber,
      zendesk_images: []
    }
    let actionUrl = `https://harshad-dev.myshopify.com/apps/simplyinsurance/storefront-api/getInsuranceclaimrequests`;
    fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'shopname':"harshad-dev.myshopify.com"
      },
      body: JSON.stringify(passObj)
    }).then(data=>data.json())
    .then(data=>{
      if(data.status == 0){
        location.reload();
      }else{
        console.log('error');
      }
      setClaimSubmitLoading(false);
    })
  }
  return(
    <div>
      {pageStep === 0 &&
        <div className="order-claim-page-wrap">
          <div className="simply-container">
            <div className="header-section">
              <h1 className="title-wrap">Raise order claim</h1>
            </div>
            <div className="bottom-form-section">
              <div className="bottom-form-section-inner">
                <div className="label-input-wrap-main">
                  <div className="email-input-wrap label-input-wrap">
                    <div className="label-wrap">
                      <label id="email-field-label" htmlFor="email-field-input">Enter your email</label>
                    </div>
                    <div className="input-wrap">
                      <input id="email-field-input" name="customer_email" value={userEmail} onChange={(e)=>setUserEmail(e.target.value)} placeholder="Enter your email" type="email" required />
                    </div>
                  </div>
                  <div className="order-input-wrap label-input-wrap">
                    <div className="label-wrap">
                      <label id="order-field-label" htmlFor="order-field-input">Order Number</label>
                    </div>
                    <div className="input-wrap">
                      <input id="order-field-input" name="order_number" value={orderNumber} onChange={(e)=>setOrderNumber(e.target.value)} placeholder="#Order Number" required />
                    </div>
                  </div>
                </div>
                <div className="submit-button-wrap">
                  <div className="submit-button-inner">
                    <button type="button" className="submit-button" onClick={()=>orderClaimEvent()} disabled={claimButtonLoading}>
                      <span className="button-text">
                        {claimButtonLoading ? "Loading" :"Submit" }</span>
                    </button>
                  </div>
                </div>
                {claimError &&
                  <p className="incorrect-value-order">{claimError}</p>
                }
              </div>
            </div>
          </div>
        </div>
      }
      {pageStep === 1 &&
        <div className="manage-claim-request-wrap">
          {orderData &&
            <div className="manage-claim-container">
              <div className="top-section">
                <div className="back-button">
                  <a className="" href="/pages/claim-portal">
                    Back
                  </a>
                </div>
                <div className="order-number-wrap">
                  <h1 className="order-wrap-text">{orderData.order_name}</h1>
                </div>
                <div className="order-top-section">
                  <table>
                    <thead>
                      <tr>
                        <th>Order placed at</th>
                        <th>Order status</th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="order-placed-text">
                          {date.toDateString()}
                        </td>
                        <td className="order-status-text">
                          {orderData.fulfillment_status}
                        </td>
                        <td className="order-name-text">{orderData.customer_name}</td>
                        <td className="order-email-text">{orderData.email}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bottom-section">
              {orderData.fulfillments && orderData.fulfillments.map((item,index)=>{
                return(
                <div className="bottom-section-inner" data-fulfilment_id={item.fulfilment_id}>
                  <div className="tracking-section">
                    <div className="tracking-heading">
                      <h2 className="tracking-heading-inner">Fulfilled ({item.line_items.length}) <span className="order-number">{item.fulfilment_name}</span></h2>
                    </div>
                    <div className="order-tracking-wrap">
                      Other tracking
                      <a className="order-tracking-url" href="${item.tracking_url}">
                        <svg viewBox="0 0 20 20" className="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M13 12a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H6c-.575 0-1-.484-1-1V7a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2v5h5a1 1 0 0 1 1-1zm-2-7h4v4a1 1 0 1 1-2 0v-.586l-2.293 2.293a.999.999 0 1 1-1.414-1.414L11.586 7H11a1 1 0 0 1 0-2z"></path></svg>
                      </a>
                    </div>
                  </div>
                  <div className="order-items-section">
                    <div className="claim-status-wrap">
                    Claim status<span className="badge-requested ${item.claim_status ? 'requested' : ''}">{item.claim_status ? item.claim_status : 'Not requested'}</span>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                      {item.line_items.map((i,j)=>{
                        let currency_code = item.currency;
                        return(
                        <tr>
                          <td>{i.title}</td>
                          <td><span className="currency-code">{currency_code}</span> {i.price} x {i.quantity}</td>
                          <td><span className="currency-code">{currency_code}</span> {i.price * i.quantity}</td>
                        </tr>
                        )
                      })}
                      </tbody>
                    </table>
                  </div>
                  <div className="generate-claim-section">
                    {item.claim_status ?
                      <button className="generate-claim-button" disabled>Generate claim request</button>
                      :
                      <button className="generate-claim-button" onClick={(e)=>generateClaim(e)}>Generate claim request</button>
                    }
                  </div>
                </div>
                )
              })}
              </div>
            </div>
          }
        </div>
      }
      {showPopup &&
        <div className="custom-popup-wrap">
          <div className="custom-popup-inner">
            <div className="custom-popup-sub-inner">
              <div className="top-section-wrap">
                <h2 className="title-wrap">Claim request note</h2>
                <button className="close-btn" onClick={()=>popupClose()}><svg viewBox="0 0 20 20" className="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M11.414 10l6.293-6.293a.999.999 0 1 0-1.414-1.414L10 8.586 3.707 2.293a.999.999 0 1 0-1.414 1.414L8.586 10l-6.293 6.293a.999.999 0 1 0 1.414 1.414L10 11.414l6.293 6.293a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L11.414 10z" fillRule="evenodd"></path></svg></button>
              </div>
              <div className="center-section-wrap">
                <div className="customer-note-section">
                  <label className="label-wrap">Customer Note</label>
                  <textarea placeholder="Enter Note" onChange={(e)=>{setCustomerNote(e.target.value)}} className="textarea-wrap" aria-invalid="false" aria-multiline="true" style={{height:"204px"}} spellCheck="false"></textarea>
                  {customerNoteError && <p className="customer-note-issue">Please Enter Customer Note.</p>}
                </div>
                <div className="image-upload-section">
                  <label className="label-wrap">Product images</label>
                  <form className="box" encType="multipart/form-data">
                    <input id="upload-file" accept="image/*" type="file" onChange={(e)=>imageUpload(e)} multiple autoComplete="off" />
                  </form>
                </div>
              </div>
              <div className="bottom-section-wrap">
              {imagesLoading ?
                <button className="submit-claim-button" disabled>Submit claim request</button>
              :
                <button className="submit-claim-button" onClick={()=>claimSubmitEvent()}>
                  {claimSubmitLoading ? "Loading" :"Submit claim request" }
                </button>
              }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

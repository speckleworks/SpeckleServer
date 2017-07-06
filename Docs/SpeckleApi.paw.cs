using System;
using System.Threading.Tasks;
using System.Net;
using System.IO;
using System.Text;

namespace MyNamespace {
	public class MyActivity {
		
		private async Task<bool> RegisterUser () {

			string url = "http://localhost:8080/auth/register";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.ContentType = "application/json; charset=utf-8";
			
			request.Method = "POST";
			
			string postData = "{\"email\":\"johndoe@apple.com\",\"password\":\"luxurygoods\"}";
			ASCIIEncoding encoding = new ASCIIEncoding ();
			byte[] byte1 = encoding.GetBytes (postData);
			request.ContentLength = byte1.Length;
			Stream newStream = request.GetRequestStream ();
			newStream.Write (byte1, 0, byte1.Length);
			newStream.Close ();
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Loginuser () {

			string url = "http://localhost:8080/auth/login";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.ContentType = "application/json; charset=utf-8";
			
			request.Method = "POST";
			
			string postData = "{\"email\":\"johndoe@apple.com\",\"password\":\"luxurygoods\"}";
			ASCIIEncoding encoding = new ASCIIEncoding ();
			byte[] byte1 = encoding.GetBytes (postData);
			request.ContentLength = byte1.Length;
			Stream newStream = request.GetRequestStream ();
			newStream.Write (byte1, 0, byte1.Length);
			newStream.Close ();
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Getuserprofile () {

			string url = "http://localhost:8080/api/profile";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.Headers.Add("Authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiVXNlciAxIiwiaWF0IjoxNDk5MzM4MDE5LCJleHAiOjE0OTk0MjQ0MTl9.jFV8RDj7c8WaQff0EHWaZwXHG8pGv9ZcxE97_My0t4A");
			
			request.Method = "GET";
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Createanewstream () {

			string url = "http://localhost:8080/api/streams";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.Headers.Add("Authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4");
			
			request.Method = "POST";
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Duplicatesastream () {

			string url = "http://localhost:8080/api/streams/duplicate/BJG6Qe-V-";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.Headers.Add("Authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4");
			
			request.Method = "POST";
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Getallstreams () {

			string url = "http://localhost:8080/api/streams";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.Headers.Add("Authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiVXNlciAxIiwiaWF0IjoxNDk5MzM4MDE5LCJleHAiOjE0OTk0MjQ0MTl9.jFV8RDj7c8WaQff0EHWaZwXHG8pGv9ZcxE97_My0t4A");
			
			request.Method = "GET";
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Getstream () {

			string url = "http://localhost:8080/api/streams/BJG6Qe-V-";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			
			request.Method = "GET";
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Getstreammeta () {

			string url = "http://localhost:8080/api/streams/meta/BJG6Qe-V-";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.Headers.Add("Authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4");
			
			request.Method = "GET";
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Updatestream () {

			string url = "http://localhost:8080/api/streams/BJG6Qe-V-";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.ContentType = "application/json; charset=utf-8";
			request.Headers.Add("Authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4");
			
			request.Method = "PUT";
			
			string postData = "{\"objects\":[{\"properties\":{\"A\":{\"properties\":{\"A\":{\"value\":[0,0,0],\"properties\":{},\"type\":\"Point\",\"hash\":\"Point.c6f057b86584942e415435ffb1fa93d4\"},\"B\":{\"origin\":{\"value\":[0,0,0],\"properties\":null,\"type\":\"Point\",\"hash\":\"Point.c6f057b86584942e415435ffb1fa93d4\"},\"normal\":{\"value\":[0,0,1],\"properties\":null,\"type\":\"Vector\",\"hash\":\"Vector.dc5c7986daef50c1e02ab09b442ee34f\"},\"xdir\":{\"value\":[1,0,0],\"properties\":null,\"type\":\"Vector\",\"hash\":\"Vector.f899139df5e1059396431415e770c6dd\"},\"ydir\":{\"value\":[0,1,0],\"properties\":null,\"type\":\"Vector\",\"hash\":\"Vector.ea20a043c08f5168d4409ff4144f32e2\"},\"properties\":null,\"type\":\"Plane\",\"hash\":\"Plane.28d87a307987464d06ceee45f81ba19a\"}},\"value\":[-11,-9,0,-5,-5,0,-1,-14,0,7,-14,0,8,-12,0,4,-6,0],\"type\":\"Polyline\",\"hash\":\"Polyline.b8cabb148761a918b22128c8f05b1d47\"}},\"vertices\":[-1,0,-2,0,0,-2,1,0,-2,-1,0,0,0,0,0,1,0,0,-1,0,2,0,0,2,1,0,2],\"faces\":[1,0,1,4,3,1,1,2,5,4,1,3,4,7,6,1,4,5,8,7],\"colors\":[],\"type\":\"Mesh\",\"hash\":\"Mesh.2c3176b21893ac1cb0b69d83f49fa1f6\"},{\"value\":[0,0,0],\"properties\":null,\"type\":\"Vector\",\"hash\":\"Vector.c6f057b86584942e415435ffb1fa93d4\"}],\"name\":\"Wrong side of the moon\",\"layers\":[]}";
			ASCIIEncoding encoding = new ASCIIEncoding ();
			byte[] byte1 = encoding.GetBytes (postData);
			request.ContentLength = byte1.Length;
			Stream newStream = request.GetRequestStream ();
			newStream.Write (byte1, 0, byte1.Length);
			newStream.Close ();
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Getprivatestreamowner () {

			string url = "http://localhost:8080/api/streams/SyLPkGgNW";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.Headers.Add("Authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiVXNlciAxIiwiaWF0IjoxNDk5MzM4MDE5LCJleHAiOjE0OTk0MjQ0MTl9.jFV8RDj7c8WaQff0EHWaZwXHG8pGv9ZcxE97_My0t4A");
			
			request.Method = "GET";
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Getprivatestreamshared () {

			string url = "http://localhost:8080/api/streams/rkwnygWNb";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.Headers.Add("Authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4");
			
			request.Method = "GET";
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
		private async Task<bool> Getprivatestreamanonymous () {

			string url = "http://localhost:8080/api/streams/SyLPkGgNW";

			HttpWebRequest request = (HttpWebRequest)WebRequest.Create (new Uri(url));
			request.Headers.Add("Authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4");
			
			request.Method = "GET";
			
			using (WebResponse response = await request.GetResponseAsync ()) {
				using (Stream stream = response.GetResponseStream ()) {
					return true;
					//process the response
				}
			}
		}
	}
}

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace WebProject.Helpers
{
    public static class XmlHelper
    {
        public static List<T> LoadData<T>(string filePath)
        {
            List<T> entityList = new List<T>();
            if (File.Exists(filePath))
            {
                XmlSerializer serializer = new XmlSerializer(typeof(List<T>));

                using (FileStream fileStream = new FileStream(filePath, FileMode.Open))
                {
                    entityList = (List<T>)serializer.Deserialize(fileStream);
                }
            }
            return entityList;
        }

        public static void SaveData<T>(List<T> data, string filePath)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(List<T>));
            using (FileStream fileStream = new FileStream(filePath, FileMode.Create))
            {
                serializer.Serialize(fileStream, data);
            }
        }
    }
}